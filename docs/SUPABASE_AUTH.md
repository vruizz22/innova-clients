# Supabase Auth — innova-clients

> Contrato de auth para `apps/web` (Next.js 14 App Router), `apps/mobile-student` y `apps/mobile-parent` (Expo).
> Referencia: `../../docs/MASTER_PLAN_v7.md` §5, ADR-101, ADR-103.
> **Regla #0:** todos los comandos de instalación los corre Victor.

---

## 1. Stack

- `@supabase/supabase-js` (todas las plataformas).
- `@supabase/ssr` (Next.js App Router) — cookies httpOnly + refresh transparente en middleware.
- `expo-secure-store` + `@supabase/supabase-js` (mobile) — token persistido en Keychain/Keystore.

Comandos para Victor:
```bash
cd innova-clients
pnpm add -w @supabase/supabase-js @supabase/ssr
pnpm --filter @innova/mobile-student add expo-secure-store
pnpm --filter @innova/mobile-parent  add expo-secure-store
```

---

## 2. Estructura de `packages/supabase/`

```
packages/supabase/
├── src/
│   ├── client.ts        # createBrowserClient (web client component)
│   ├── server.ts        # createServerClient (Next.js Server Components + Route Handlers)
│   ├── middleware.ts    # session refresh + role-based redirect helpers
│   ├── mobile.ts        # createMobileClient (Expo, usa SecureStore)
│   ├── types.ts         # Database type generado con `supabase gen types typescript`
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## 3. Snippets canónicos

### 3.1 `packages/supabase/src/client.ts` (Browser)

```ts
'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

### 3.2 `packages/supabase/src/server.ts` (Server Components / Route Handlers)

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

export const createClient = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};
```

### 3.3 `apps/web/middleware.ts` (route-group routing por rol)

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ROLE_HOME: Record<string, string> = {
  student: '/practice',
  teacher: '/dashboard',
  parent: '/family',
  admin: '/admin',
};

const ROLE_PREFIXES: Record<string, string[]> = {
  student: ['/practice'],
  teacher: ['/dashboard', '/classes', '/assignments'],
  parent: ['/family'],
  admin: ['/admin'],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)),
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  const PUBLIC = ['/', '/login', '/signup', '/forgot-password', '/api/health'];
  if (PUBLIC.some((p) => path === p || path.startsWith('/_next'))) return res;

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  const role = (user.app_metadata?.role as string | undefined) ?? 'student';
  const allowed = ROLE_PREFIXES[role] ?? [];
  const onWrongSection = !allowed.some((p) => path.startsWith(p));
  if (onWrongSection) {
    const url = req.nextUrl.clone();
    url.pathname = ROLE_HOME[role] ?? '/login';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 3.4 Signup con rol (Server Action)

```ts
'use server';
import { createClient } from '@innova/supabase/server';

export async function signupAction(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const role = String(formData.get('role')); // 'student' | 'teacher' | 'parent'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: String(formData.get('full_name')) },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  // El custom claim `role` lo setea un trigger Postgres en auth.users
  // basado en el `raw_app_meta_data.role` que pasamos vía Admin API o
  // por dominio del email. Ver §5.
  return { ok: true };
}
```

### 3.5 OAuth con Google (SSO colegio)

```ts
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    scopes: 'openid email profile',
  },
});
```

Para integración con Google Classroom roster sync (ADR-108), el admin del colegio usa otro flujo OAuth con scopes adicionales (`classroom.courses.readonly`, etc.) y los tokens se guardan en `school_integration.config` (backend), no en la sesión Supabase del admin.

### 3.6 Mobile (Expo)

```ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
```

---

## 4. Cómo el backend recibe el JWT

Cliente envía `Authorization: Bearer <access_token>` a `api.superprofes.app/*`. Cómo obtenerlo desde el cliente:

```ts
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
fetch(`${API_URL}/courses/mine`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

Detalles de validación en `innova-backend-serverless/docs/auth-integration-supabase.md`.

---

## 5. Custom claim `role` — Postgres trigger en Supabase

Asignar el rol por defecto al signup (corre en Supabase SQL editor, una vez):

```sql
create or replace function public.set_default_role()
returns trigger language plpgsql security definer as $$
declare
  inferred_role text;
begin
  inferred_role := coalesce(
    new.raw_app_meta_data->>'role',
    case
      when new.email like '%@superprofes.app' then 'admin'
      else 'student'
    end
  );
  new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', inferred_role);
  return new;
end $$;

create trigger on_user_signup
  before insert on auth.users
  for each row execute function public.set_default_role();
```

Para cambiar el rol de un usuario después del signup, usa la Admin API desde el backend (nunca desde el cliente):

```ts
// server-only, usar SUPABASE_SERVICE_ROLE_KEY
await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'teacher' },
});
```

---

## 6. RLS — Row Level Security

Activable post-M9. Ejemplo para `student_topic_mastery`:

```sql
alter table student_topic_mastery enable row level security;

-- alumno ve sólo lo suyo
create policy student_self on student_topic_mastery
  for select using (
    student_id = (
      select s.id from student s
      join "user" u on u.id = s.user_id
      where u.supabase_uid = auth.uid()
    )
  );

-- profe del curso ve a sus alumnos
create policy teacher_course on student_topic_mastery
  for select using (
    exists (
      select 1 from enrollment e
      join course_teacher ct on ct.course_id = e.course_id
      join teacher t on t.id = ct.teacher_id
      join "user" u on u.id = t.user_id
      where e.student_id = student_topic_mastery.student_id
        and u.supabase_uid = auth.uid()
    )
  );
```

**Importante:** las queries del backend NestJS usan `SUPABASE_SERVICE_ROLE_KEY` que **bypass RLS**. RLS protege accesos directos desde el cliente Supabase (si en algún momento decidimos consultar la DB directamente sin pasar por el backend — caso útil para Realtime).

---

## 7. Anti-patrones (no hacer)

- ❌ `localStorage.setItem('access_token', ...)` — usar `@supabase/ssr` que mete httpOnly cookie automáticamente.
- ❌ Exponer `SUPABASE_SERVICE_ROLE_KEY` al cliente (jamás con prefijo `NEXT_PUBLIC_*`).
- ❌ Confiar en `app_metadata` desde el cliente sin verificar JWT en el backend — el cliente puede alterar headers, sólo el backend valida.
- ❌ Hacer `fetch` directo a `${SUPABASE_URL}/rest/v1/...` desde el cliente para data de negocio — usar el backend NestJS para no acoplar UI al schema de DB.
- ❌ Manejar tokens en mobile con `AsyncStorage` simple — usar `SecureStore` (Keychain/Keystore).
- ❌ Mantener `apps/practice`, `apps/teacher`, `apps/parent` con auth viejo en paralelo más allá de M9 — generan drift.

---

## 8. Plan de migración (alineado con M8 + M9)

1. **M8** — backend implementa `SupabaseJwtStrategy` y queda compatible con tokens Supabase (corre en paralelo al JWT custom durante 1 semana).
2. **M8** — crear `packages/supabase/` con los 3 snippets clave (client/server/middleware).
3. **M9** — `apps/web/(auth)/login` migra a Supabase. Smoke test Playwright captura el flujo.
4. **M9** — `apps/web/middleware.ts` aplica role routing. Las apps viejas se cortan.
5. **M13** — mobile apps adoptan Supabase desde día 1 (no hay legacy).
6. **Post-M9** — borrar `CognitoGuard`, JWT custom, `localStorage.getItem('innova.auth.session')`.

---

## 9. Variables de entorno

```env
# apps/web
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<jwt>
SUPABASE_SERVICE_ROLE_KEY=<jwt>          # server-only, NUNCA NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL=https://app.superprofes.app

# apps/mobile-*
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Validar en `packages/env/index.ts` con `@t3-oss/env-nextjs` + Zod.
