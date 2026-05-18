# PLAN v7 — Addendum innova-clients

> Acciones concretas. Referencia principal: `../../docs/MASTER_PLAN_v7.md`.
> **Regla #0:** el agente NO ejecuta `pnpm install/add/build`, `vercel`, `eas`, `playwright install`, `npx expo start`. Los entrega para que Victor los corra. Ver `CLAUDE.md §0`.

---

## Sprint S1 (M8 — Supabase Auth, 1 semana)

**Objetivo:** signup/login funcional con Supabase en una página de prueba dentro de `apps/practice` (sin migrar todavía a `apps/web`).

1. Crear `packages/supabase/` con:
   - `client.ts` (`createBrowserClient` desde `@supabase/ssr`)
   - `server.ts` (`createServerClient` con cookies de Next.js)
   - `middleware.ts` (refresh de sesión + role-based redirect helpers)
   - `types.ts` (Database type generado con `supabase gen types typescript`)
2. Comando a entregar a Victor:
   ```bash
   cd innova-clients
   pnpm add -w @supabase/supabase-js @supabase/ssr
   pnpm dlx supabase@latest init
   pnpm dlx supabase@latest gen types typescript --project-id <PROJECT> > packages/supabase/types.ts
   ```
3. Documentar en `docs/SUPABASE_AUTH.md` el flujo signup/login/logout/role-claim con snippets de `middleware.ts` y `createServerClient`.
4. Página `apps/practice/app/(auth)/supabase-test/page.tsx` que hace signup/login y muestra la sesión — sólo para validar.
5. Mantener auth viejo en paralelo hasta que `apps/web` esté listo.

**DoD:** un usuario test (`test@superprofes.app`) puede signup/login/logout en la página de prueba. Cookie httpOnly visible en DevTools. Token llega válido al backend (probar con `curl https://api.superprofes.app/auth/me` post-M8 backend).

---

## Sprint S2-S4 (M9 — `apps/web` unificada, 3 semanas)

### S2: scaffolding + auth + design system

1. Comando entregar:
   ```bash
   cd innova-clients
   pnpm create next-app@14 apps/web --typescript --app --tailwind --eslint --src-dir=false --import-alias='@/*' --no-git
   ```
2. Reorganizar `apps/web/app/` con route groups:
   ```
   app/
   ├── (marketing)/page.tsx
   ├── (auth)/login/page.tsx
   ├── (student)/practice/page.tsx
   ├── (teacher)/dashboard/page.tsx
   ├── (parent)/family/page.tsx
   ├── api/health/route.ts
   └── middleware.ts
   ```
3. Wire `packages/supabase` + `packages/api-client` + `packages/ui`.
4. `middleware.ts` con role-based redirect:
   - sin sesión → `/login`
   - rol no calza con route group → redirect a su home
5. Primer smoke test Playwright: login → student/practice → screenshot.

### S3: porting de pantallas

Para cada flujo: copiar componentes de `apps/practice|teacher|parent` a `apps/web/(student|teacher|parent)`, reemplazar imports de `@components/api-client` por `@innova/api-client`, reemplazar `auth-session.ts` (localStorage) por hooks Supabase.

Pantallas críticas a portar (en orden):
- `(auth)/login` con selector visual de rol (sólo si el rol no se infiere del JWT — recomendado: inferir y omitir selector)
- `(student)/practice` con `math-input` + `upload-scanner`
- `(student)/practice/[exerciseId]` feedback view
- `(teacher)/dashboard` heatmap real (post-M10 endpoints)
- `(teacher)/classes/[courseId]` drill-down
- `(teacher)/assignments/new` flujo asignar práctica
- `(parent)/family` lista de hijos + progreso

### S4: cutover

1. `deploy-vercel.yml` reescrito a 1 sólo job (`apps/web`).
2. Crear proyecto Vercel `superprofes-web`, dominio `app.superprofes.app`.
3. Redirects 301 desde `practice|profe|padres.superprofes.app` → `app.superprofes.app/...`.
4. Borrar `apps/practice`, `apps/teacher`, `apps/parent`, `apps/mobile` skeleton.
5. Borrar workflows viejos `deploy-vercel-practice/teacher/parent`.

**DoD:** `app.superprofes.app/dashboard` rendea para un profe logueado con Supabase. Smoke test Playwright pasa en CI con screenshot adjunto.

---

## Sprint S5-S6 (M13 — Mobile Expo desde cero, 2 semanas)

1. Comandos:
   ```bash
   cd innova-clients/apps
   pnpm create expo@latest mobile-student --template default
   pnpm create expo@latest mobile-parent  --template default
   ```
2. Cada app consume `packages/supabase`, `packages/api-client`, `packages/ui` (RN-compatible: usar Tamagui o NativeWind, **no Tailwind nativo**).
3. Sesión persistida con `expo-secure-store` (no `AsyncStorage` para tokens).
4. `mobile-student`: scanner cámara con `expo-camera` + upload a S3 presigned + polling `/attempts/:id/status`.
5. `mobile-parent`: lista hijos + progreso.
6. EAS: 2 proyectos, `eas.json` con dev/preview/production. Decisión Apple Dev pendiente (sin él, sólo Android).

**DoD:** APK Android instalable. Sesión persiste tras kill. Cámara captura + upload OK.

---

## Smoke testing — Playwright MCP

Doc detallado en `docs/SMOKE_TESTING.md` (crear).

Reglas resumen:
- Los agentes usan **Playwright MCP** (lectura, sin instalar nada).
- Cada smoke test captura screenshot full-page + screenshots de componentes clave (`page.locator(...).screenshot()`).
- Compara contra `SuperProfes-Design-System/preview/<slug>.png` con `expect(screenshot).toMatchSnapshot({ maxDiffPixelRatio: 0.05 })`.
- Si difiere >5%, el agente reporta el diff en el PR. **No** auto-actualiza el baseline.
- Baselines del Design System se actualizan **sólo** cuando cambia el diseño (PR aparte etiquetado `design-system-update`).

---

## Backlog técnico (no bloqueante)

- [ ] Generar tipos OpenAPI del backend en `packages/api-client/src/generated.ts`: comando `pnpm dlx openapi-typescript https://api.superprofes.app/openapi.json -o packages/api-client/src/generated.ts`.
- [ ] Migrar Astro landing a `app/(marketing)/` si SEO permite. Validar con Lighthouse pre/post.
- [ ] Reemplazar `recharts` por `visx` si bundle size es problema en teacher dashboard.
- [ ] Pre-commit hook con `lint-staged` + `prettier` (`pnpm dlx husky init`).
