# Frontend Polish v10 — UI/UX maximization

> Objetivo: llevar el frontend (landing Astro + apps/web Next.js) al máximo nivel de UI/UX,
> aplicando y mejorando el **SuperProfes Design System**, nada hardcodeado, escalable, con
> dark/light automático por sistema, integrado con backend + ai-engine, y prod+local friendly.
>
> Skills usadas: `impeccable` (hook activo por edición), `emil-design-eng` (motion/craft),
> `design-taste-frontend` / taste-skill (anti-slop, layout, contraste).

## Decisiones (confirmadas con el usuario)

1. **Nombre de usuario**: ambos — campo *Nombre* en registro → `user_metadata.full_name`, **y** `/auth/me`
   tipado extendido para devolver `name`.
2. **OG image**: SVG de marca en el repo + script de rasterizado (sin instalar nada nuevo).
3. **Sesión cross-origin (#4)**: cookie compartida en dominio padre `.superprofes.app` (env-gated).

## Foundation (base — nada hardcodeado)

- **Marca**: `Logo` React (`@innova/ui`) + `Logo.astro` (landing), SVG inline que hereda `currentColor`
  (se adapta a light/dark y a fondos oscuros). Assets en `apps/web/public/brand/` y `landing/public/brand/`.
- **Favicon**: `apps/web/app/icon.svg` (Next auto) + `landing/public/favicon.svg` + apple-touch (raster por script).
- **OG**: `landing/public/og-image.svg` (1200×630, marca) + `scripts/render-og.mjs` (Chromium de Playwright,
  Inter local) → genera `og-image.png` + `apple-touch-icon.png` en ambos apps. Metadata OG/Twitter completa en
  `BaseLayout.astro` (landing) y `app/layout.tsx` (web, `metadataBase` + `openGraph` + `twitter` + `viewport`).
- **Dark mode automático (prefers-color-scheme)**: tokens semánticos que *flipean* solos
  (`tokens.css` de `@innova/ui` + `SuperProfes-Design-System/colors_and_type.css`, fuente única).
  Solo flipean tokens semánticos; las rampas sky/mint/slate se preservan (identidad de marca).
- **Tailwind semántico** (ambos apps): `bg-canvas{,-student,-parent,-teacher}`, `bg-surface{,-2}`,
  `text-ink{,-muted,-subtle,-inverse}`, `border-line{,-strong}`, `bg-brand{,-hover,-press}`, `text-brand-fg`,
  `bg-mark-bg`, sombras `card/pop` → vars. `darkMode: 'media'`. Escala **semántica de z-index**
  (`z-sticky`, `z-popover`, …). `color-scheme: light dark` en `<html>`.

## Estado por ítem del usuario

| # | Ítem | Estado |
|---|------|--------|
| 1 | OG funcional en la landing (y web) | ✅ SVG+script+metadata. Falta correr `render-og.mjs` (genera PNG). |
| 2 | Logo en landing + web + favicon; navbar dashboard = landing | ✅ `Logo` compartido en navbar, auth, landing; favicons. |
| 3 | Dark/light automático por sistema (todo el DS) | ✅ Base completa; componentes clave migrados. Migración del resto: en progreso. |
| 4 | auth/ME integrado + nombre en navbar + ver perfil | ✅ navbar muestra nombre (no email) + `ProfileMenu` + página `/account` + `/auth/me` con `name`. |
| 5 | Dashboard con margen lateral innecesario | ✅ AppShell `max-w-[1600px]` + padding responsivo (antes 1280 centrado). |
| 6 | Drag & drop en todas las subidas | ✅ `Dropzone` (accesible, teclado, cámara móvil) en GuideUploader, MathPhotoUploader, ScanFlow. |
| 7 | Reflejo de sesión cross-origin prod+local | ◑ Enabler de cookie compartida hecho (env-gated). Falta detección en landing (req. dependencia). |
| 8 | apps/web usa "SuperProfes" en texto, no el logo | ✅ Logo real en navbar, auth y panel de marca. |
| 9 | Auth sin opción de mostrar contraseña | ✅ Toggle accesible en todos los campos de contraseña. |
| 10 | Aplicar y mejorar el DS al máximo | ◑ Auth + shell + uploaders al máximo; resto de dashboards en progreso. |

## Pendiente (próximos pasos)

- **Migrar a tokens semánticos** el resto de componentes de dashboard (DashboardClient, CourseHeatmapView,
  GuideDetailView, QuizView, ResultsMatrix, ReviewWizard, FeedbackPanel, ReportErrorPanel, family/admin) para
  que el dark mode sea 100% en todas las pantallas.
- **Inter self-host en apps/web**: hoy `tokens.css` referencia `--font-sans: Inter` pero la web no carga las
  fuentes (la landing sí, vía `/design-system/fonts/inter.css`). Cargar Inter con `next/font/local` apuntando a
  `SuperProfes-Design-System/fonts/*.otf` y exponer la var. (Gap del DS.)
- **#4 detección en landing**: añadir `@supabase/ssr` a la landing + cliente browser que lea la cookie compartida
  y muestre "Ir al panel" cuando hay sesión (reemplazar el `localStorage` roto de `SmartLoginButton.astro`).
  Requiere `NEXT_PUBLIC_COOKIE_DOMAIN=.superprofes.app` en prod y `PUBLIC_SUPABASE_URL/ANON_KEY` en la landing.
- **Landing dark**: verificar/migrar componentes de la landing que aún usan hex/clases fijas a tokens.

## Comandos para Victor (WSL2 — el agente no los corre)

```bash
cd ~/repositorios/innova/innova-clients

# 1) Generar el OG raster + apple-touch (usa el Chromium de Playwright; instala navegador si falta)
pnpm --filter @innova/web exec playwright install chromium   # solo si no está
node landing/scripts/render-og.mjs
#   Fallback sin Playwright (necesita librsvg):
#   rsvg-convert -w 1200 -h 630 landing/public/og-image.svg -o landing/public/og-image.png
#   cp landing/public/og-image.png apps/web/public/og-image.png

# 2) Typecheck + lint (verificar los cambios)
pnpm -r run typecheck   # o: pnpm --filter @innova/web exec tsc --noEmit
pnpm -r run lint

# 3) Levantar para revisar (light y dark: cambia el tema del SO)
pnpm --filter @innova/web dev      # http://localhost:3005
pnpm --filter landing dev          # http://localhost:3004

# 4) Backend (innova-backend-serverless) — /auth/me ahora devuelve `name` (sin migración DB)
cd ~/repositorios/innova/innova-backend-serverless
pnpm jest src/modules/auth   # tests de auth (asserts por campo, no rompen)
```

### Env nueva (opcional, prod)

```env
# apps/web (.env) — habilita sesión compartida landing↔web en prod
NEXT_PUBLIC_COOKIE_DOMAIN=.superprofes.app
NEXT_PUBLIC_SITE_URL=https://app.superprofes.app   # metadataBase OG
```
