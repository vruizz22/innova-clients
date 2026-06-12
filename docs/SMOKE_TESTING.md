# Smoke Testing — Playwright MCP + Design System

> Contrato vinculante para cualquier agente (humano o IA) que toque UI en `apps/web` o `apps/mobile-*`.
> Referencia: ADR-107, `../../docs/MASTER_PLAN_v7.md` §5.4.
> **Regla #0:** Playwright MCP se usa como herramienta de lectura. `pnpm dlx playwright install` lo corre Victor.

---

## 1. Propósito

Detectar drift visual entre la implementación y el Design System (`SuperProfes-Design-System/preview/*`) **antes del merge**, sin depender de inspección manual.

---

## 2. Cuándo correr smoke tests

| Disparador | Tests a correr | Quién |
|---|---|---|
| PR que toca `apps/web/app/**`, `packages/ui/**`, `packages/error-renderer/**` | smoke del/los flujos afectados | CI + agente que abre la PR |
| PR que toca `SuperProfes-Design-System/preview/**` | regenerar baselines, etiquetar PR `design-system-update` | Victor (revisión visual previa) |
| Merge a `main` | suite completa | CI |
| Antes de un deploy a producción | suite completa + visual comparison report adjunto al release notes | CI |

No correr smoke tests para PRs que sólo tocan `packages/api-client`, backend, ai-engine, docs, scripts.

---

## 3. Estructura

```
apps/web/
├── tests/
│   ├── smoke/
│   │   ├── auth.login.spec.ts
│   │   ├── student.practice.spec.ts
│   │   ├── student.feedback.spec.ts
│   │   ├── teacher.dashboard.spec.ts
│   │   ├── teacher.class-detail.spec.ts
│   │   ├── teacher.assign-practice.spec.ts
│   │   ├── parent.family.spec.ts
│   │   └── marketing.landing.spec.ts
│   ├── fixtures/
│   │   ├── users.ts          # cuentas de test Supabase
│   │   └── seed-data.ts      # seeds para smoke
│   ├── playwright.config.ts
│   └── visual.utils.ts       # helper para comparación
```

---

## 4. Cuentas de test Supabase

```ts
// tests/fixtures/users.ts
export const TEST_USERS = {
  student: { email: 'smoke.student@superprofes.app',  password: '<env>' },
  teacher: { email: 'smoke.teacher@superprofes.app',  password: '<env>' },
  parent:  { email: 'smoke.parent@superprofes.app',   password: '<env>' },
  admin:   { email: 'smoke.admin@superprofes.app',    password: '<env>' },
};
```

Estas cuentas viven en el proyecto Supabase de **staging** (no producción). Passwords en GitHub Secrets `SUPABASE_TEST_PASSWORDS`. Crear como Victor:
```bash
# Una vez, manual en Supabase dashboard o vía SDK
npx tsx scripts/create-smoke-users.ts
```

---

## 5. Tolerancia y baseline

- Tolerancia inicial: `maxDiffPixelRatio: 0.05` (5% de píxeles distintos).
- Bajar a `0.02` cuando los flujos estén estables (estimado: post-piloto).
- Baseline en `tests/smoke/__screenshots__/<test-name>/<step>.png` — commiteado en repo.
- **No actualizar baselines automáticamente.** Regeneración manual sólo en PRs con label `design-system-update`.

---

## 6. Mapping Ruta → Preview

| Ruta `apps/web` | Preview Design System | Archivo |
|---|---|---|
| `/login` | `UI kit · Auth` | `SuperProfes-Design-System/preview/auth/login.png` |
| `/practice` | `UI kit · Practice (student) · Web` | `preview/practice/web-home.png` |
| `/practice/[exerciseId]` (input) | `UI kit · Practice · Step input` | `preview/practice/step-input.png` |
| `/practice/[exerciseId]` (feedback) | `UI kit · Practice · Feedback` | `preview/practice/feedback.png` |
| `/dashboard` | `UI kit · Teacher Dashboard` | `preview/teacher/dashboard.png` |
| `/classes/[courseId]` | `UI kit · Teacher · Class Detail` | `preview/teacher/class-detail.png` |
| `/assignments/new` | `UI kit · Teacher · Assign Practice` | `preview/teacher/assign-practice.png` |
| `/family` | `UI kit · Parent · Web Dashboard` | `preview/parent/web-dashboard.png` |
| `/` (marketing) | `Landing · SuperProfes` | `preview/landing/hero.png` |

Cualquier ruta nueva debe agregar fila acá **antes** del merge.

---

## 7. Template de smoke test

`tests/smoke/teacher.dashboard.spec.ts`:
```ts
import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/users';
import { loginAs } from '../visual.utils';

test.describe('teacher.dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USERS.teacher);
  });

  test('renders heatmap matching design system', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="classroom-heatmap"]');
    await expect(page).toHaveScreenshot('teacher-dashboard.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('alert panel matches preview', async ({ page }) => {
    await page.goto('/dashboard');
    const alerts = page.locator('[data-testid="alerts-panel"]');
    await expect(alerts).toHaveScreenshot('teacher-dashboard-alerts.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
```

`tests/visual.utils.ts`:
```ts
import { Page } from '@playwright/test';

export async function loginAs(page: Page, user: { email: string; password: string }) {
  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}
```

---

## 8. Reglas para agentes IA (Claude Code, etc.)

Cuando un agente edita UI:

1. **Antes** de editar — leer el preview en `SuperProfes-Design-System/preview/<componente>.png` o el HTML asociado en `SuperProfes-Design-System/preview/<componente>.html`. **No improvisar.**
2. **Después** de editar — invocar Playwright MCP:
   - Navegar a la ruta afectada.
   - Hacer login con la cuenta de test correspondiente.
   - Capturar screenshot full-page.
   - Comparar contra el preview oficial (lectura, sin commit de baseline).
3. **Si el diff visible > 5%** — incluir el screenshot capturado en la respuesta al usuario y describir las diferencias antes de pedir aprobación.
4. **Nunca** ejecutar `pnpm playwright install` o `pnpm test:smoke` directamente. Entregar el comando a Victor:
   ```bash
   cd innova-clients
   pnpm --filter @innova/web exec playwright test tests/smoke/teacher.dashboard.spec.ts --update-snapshots=none
   ```
5. **Nunca** actualizar baselines (`--update-snapshots=all`) sin etiqueta `design-system-update` y aprobación de Victor.

---

## 9. CI integration

`.github/workflows/ci.yml` (extracto):
```yaml
smoke:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v3
    - uses: actions/setup-node@v4
      with: { node-version: '20', cache: 'pnpm' }
    - run: pnpm install --frozen-lockfile
    - name: Cache Playwright browsers
      uses: actions/cache@v4
      with:
        path: ~/.cache/ms-playwright
        key: playwright-${{ hashFiles('**/pnpm-lock.yaml') }}
    - run: pnpm --filter @innova/web exec playwright install chromium --with-deps
    - run: pnpm --filter @innova/web exec playwright test tests/smoke
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL_STAGING }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_STAGING }}
        SMOKE_STUDENT_PWD: ${{ secrets.SMOKE_STUDENT_PWD }}
        SMOKE_TEACHER_PWD: ${{ secrets.SMOKE_TEACHER_PWD }}
        SMOKE_PARENT_PWD: ${{ secrets.SMOKE_PARENT_PWD }}
    - if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-diffs
        path: apps/web/test-results/
```

---

## 10. Mobile (Expo) — fuera de scope MVP

Para `apps/mobile-student` y `apps/mobile-parent`, smoke testing automatizado es post-piloto (Detox o Maestro). En MVP:
- Manual smoke en iOS Simulator + Android Emulator pre-release.
- Checklist en `tests/mobile-smoke-checklist.md` (por crear cuando empiece M13).

---

## 11. Anti-patrones

- ❌ Comparar screenshots con `toMatchSnapshot()` sin tolerancia — falsos positivos garantizados con fonts/animaciones.
- ❌ Capturar `fullPage: true` con contenido dinámico (timestamps, datos cambiantes) sin mockear esos elementos.
- ❌ Login en cada test (lento) — usar `storageState` de Playwright si el flujo lo permite.
- ❌ Smoke tests que dependen de la red real al backend de prod — usar staging API + seeds determinísticos.
- ❌ Borrar baselines "porque fallaron" sin investigar.
