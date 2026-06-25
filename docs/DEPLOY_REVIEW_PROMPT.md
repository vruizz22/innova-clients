# Prompt de auditoría de deploy — innova-clients (para Claude en Google Chrome)

> Pega este prompt en **Claude con navegación (extensión Claude for Chrome / claude.ai con
> browsing)**. Claude tiene que **abrir cada link, leer lo que ve y reportar**. No inventes:
> si un link pide login y no puedes entrar, dilo explícitamente y marca ese punto como
> `NO_VERIFICABLE`.

---

## Contexto

Estoy verificando el deploy de **innova-clients**: una app Next.js 14 (`apps/web`, route groups
student/teacher/parent/admin) con **Supabase Auth**, deployada a **Vercel** en
`https://app.superprofes.app`. El deploy se hace **solo en `main`** vía GitHub Actions
(`deploy-web.yml`). El backend vive en `https://api.superprofes.app`.

## Links a revisar

1. Workflows: `https://github.com/vruizz22/innova-clients/actions`
2. Deploy web: `https://github.com/vruizz22/innova-clients/actions/workflows/deploy-web.yml`
3. CI: `https://github.com/vruizz22/innova-clients/actions/workflows/ci.yml`
4. Secrets (no muestra valores, sí nombres): `https://github.com/vruizz22/innova-clients/settings/secrets/actions`
5. Dashboard Vercel del team (proyectos + deployments)
6. App en producción: `https://app.superprofes.app`

## Qué debes verificar y reportar (checklist)

### A. Triggers (deploy solo en main)

- [ ] Abre `.github/workflows/deploy-web.yml` en GitHub. Confirma que `on.push.branches` es **solo `[main]`** (+ `workflow_dispatch`). Reporta cualquier `feature/**`, `develop` o `**` en un workflow de **deploy**.
- [ ] Confirma que NO existen workflows extra de deploy a S3/landing/practice/teacher.

### B. Estado de runs

- [ ] En `deploy-web.yml`, ¿el último run en `main` está **verde**? Si está rojo, abre el run, entra al step que falla y **cópiame el mensaje de error exacto**.
- [ ] En `ci.yml`, ¿el último run está verde? ¿Hay steps con `continue-on-error` enmascarando fallos? Repórtalo.

### C. Vercel (la fuente típica de "deploys en ramas")

- [ ] Lista los proyectos Vercel del team. ¿Existen `innova-clients-practice` y/o `teacher`? **Deberían estar borrados/desconectados.** Si siguen, repórtalo como hallazgo crítico.
- [ ] En el proyecto `superprofes-web`: **Production Branch = `main`**. ¿Hay *Preview Deployments* automáticos por rama? ¿Está el *Ignored Build Step* configurado para saltar no-main?
- [ ] Revisa **Deployments**: ¿hay deployments recientes disparados desde ramas `feature/*` o `develop`? (no debería). Lista los últimos 5 con su rama y estado.
- [ ] En **Settings → Environment Variables (Production)**: confirma que existen `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### D. Secrets

- [ ] En la página de secrets, confirma presencia de: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_WEB`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Marca como "a borrar" los obsoletos que veas: `*_COGNITO_*`, `VERCEL_PROJECT_ID_PRACTICE/_TEACHER`, `*_PRACTICE/_TEACHER/_PARENT/_LANDING`, `S3_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID`.

### E. App viva

- [ ] Abre `https://app.superprofes.app`. ¿Carga? ¿Status? Abre la consola del navegador y reporta errores (especialmente de Supabase / `NEXT_PUBLIC_` undefined / CORS contra `api.superprofes.app`).
- [ ] Prueba la pantalla de login: ¿el formulario Supabase aparece sin errores?

## Formato de salida

Devuélveme una tabla con columnas **Check | Resultado (✅/❌/NO_VERIFICABLE) | Evidencia (qué viste) | Acción recomendada**, y al final un **veredicto**: ¿el deploy de clients cumple "solo main + Vercel limpio + secrets completos + app viva"? Sí/No y los 3 fixes más urgentes.
