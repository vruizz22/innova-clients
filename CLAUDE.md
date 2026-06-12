# CLAUDE.md — innova-clients

> Repo-specific instructions for Claude Code. Inherits all rules from `~/.claude/CLAUDE.md`.
> **Plan vigente:** ver `../docs/MASTER_PLAN_v9.md` y `./docs/PLAN_v9_ADDENDUM.md` (v7/v8 quedan como referencia histórica). Pipeline de guías: `../.github/instructions/06c-guide-pipeline.md`.
> Stack v7: Turborepo + pnpm + **una sola** Next.js 14 (App Router) + Expo SDK 51 (mobile) + (opcional) Astro landing + TypeScript strict + **Supabase Auth**.

---

## [0] REGLA OPERATIVA — install-by-user (CRÍTICA)

WSL2 colapsa cuando Claude Code consume todos los núcleos junto con `pnpm install`, `npx expo start`, `vercel deploy`, `eas build`, builds Next.js. **El agente NUNCA ejecuta esos comandos.** Los entrega en un bloque ` ```bash ` con el output esperado, y los corre Victor.

Aplica a: `pnpm install`, `pnpm add`, `pnpm dlx`, `pnpm build`, `npx expo`, `vercel`, `eas`, `playwright install`, cualquier `docker compose up` con ≥2 servicios.
**No aplica a**: lecturas (`Read`/`grep`), edición de archivos, `git status`/`log`/`diff`, tests unitarios cortos (`pnpm vitest run path/file.test.ts`).

---

## [1] Domain context — arquitectura v7 (apps unificadas)

Una sola app Next.js con route groups, dos apps Expo nativas, una landing opcional Astro.

| App | Platform | Users | MVP | Notas |
|-----|----------|-------|-----|-------|
| `apps/web` | Next.js 14 App Router | Student + Teacher + Parent + Admin | ✅ | **única SPA**, route groups `(student) (teacher) (parent) (marketing)` con middleware role-based |
| `apps/mobile-student` | Expo (web+iOS+Android) | Students | ✅ | nativo para cámara/OCR |
| `apps/mobile-parent` | Expo (web+iOS+Android) | Parents | ✅ | |
| `landing/` (Astro) | Web | Público | ⚠️ | en evaluación: si SEO no lo exige, migrar a `app/(marketing)/` y borrar |
| Tauri desktop wrappers | — | — | ❌ | descartado post-MVP, no crear scaffolding |

**Deprecadas (a borrar tras corte M9):** `apps/practice`, `apps/teacher`, `apps/parent`, `apps/mobile` (skeleton viejo). Mientras no estén borradas, **no agregar features nuevas en ellas**.

---

## [2] Turborepo + pnpm conventions

- **Package manager: `pnpm` ONLY** (workspace protocol `pnpm-workspace.yaml`).
- Root: `pnpm -r run test`, `pnpm -r run build`, `pnpm --filter apps/teacher dev`.
- Shared packages in `packages/`:
  - `packages/supabase` — `createBrowserClient`, `createServerClient`, `middleware` helpers (`@supabase/ssr`).
  - `packages/api-client` — typed API client generated from backend OpenAPI spec.
  - `packages/ui` — design system real (shadcn/ui base + Tailwind tokens). **Consumido como package**, no copia de assets.
  - `packages/design-tokens` — colors/spacing/typography.
  - `packages/math-input` — custom math keyboard + step input component (web + native).
  - `packages/upload-scanner` — camera capture + presigned S3 upload (web + native).
  - `packages/telemetry` — attempt buffer with 2s flush interval, SQS-via-API.
  - `packages/error-renderer` — renders classified error with visual step diff.
  - `packages/env` — `@t3-oss/env-nextjs` Zod validation.
- Never use `npm` or `yarn` — Turborepo pipeline depends on pnpm lockfile.

---

## [3] Deploy strategy v7: Vercel (web) + EAS (mobile)

**Decision (ADR-103/104):** un solo proyecto Vercel para `apps/web`. EAS Build para mobile. Sin AWS Amplify (descartado: añadía fricción y duplicaba CI con `serverless` del backend).

Rationale:
- Vercel free tier cubre el piloto (100 GB bandwidth, deploys ilimitados, preview por PR).
- Auth con Supabase: `@supabase/ssr` calza nativo con Next.js App Router middleware.
- Astro landing queda en evaluación; si se mantiene, **también Vercel** (segundo proyecto), no S3/CloudFront.
- EAS Build + EAS Update para OTA. TestFlight (iOS, requiere Apple Dev $99/año — decisión pendiente) + Play Console internal track (Android, $25 una vez).

**Production URLs v7:**
- `app.superprofes.app` → Vercel (única app web, route groups)
- `superprofes.app` → Vercel (Astro landing) o redirect 301 a `app/(marketing)/`
- `api.superprofes.app` → AWS API Gateway (backend serverless)
- `ai.superprofes.app` → AWS API Gateway (ai-engine)
- iOS/Android → Expo EAS

**Subdominios deprecados (redirect 301 tras corte M9):** `practice.superprofes.app`, `profe.superprofes.app`, `padres.superprofes.app` → `app.superprofes.app/{practice|dashboard|family}`.

---

## [4] TypeScript strict rules

- `strict: true` + `noImplicitAny` + `strictNullChecks` + `exactOptionalPropertyTypes`.
- **NEVER `any`** — use `unknown + type guards`, template literal types, generics.
- All API responses typed via `packages/api-client` generated types (Zod schemas + inferred types).
- `zod` for runtime validation at form boundaries and API response parsing.
- React components: always define `Props` interface, even for single-prop components.
- Server Components (Next.js App Router): no `useState/useEffect` — keep them pure.
- No `useEffect` for data fetching — use `React.use()` + Server Components + `fetch`.

---

## [5] apps/web/(student) — Student practice (web)

Platform: **Next.js App Router** route group `(student)`. Mobile nativo vive en `apps/mobile-student`.

Key flows:
1. Student lands on assignment list → taps exercise.
2. **Math input**: `packages/math-input` renders numeric keypad + step input rows.
3. Student submits each step → telemetry event buffered (2s flush).
4. On final submit → `POST /api/attempts` with `rawSteps[]` payload.
5. Feedback screen: shows `is_correct`, error type label (human-readable), encouragement.

For photo-upload flow:
1. Student taps "scan worksheet" → `packages/upload-scanner` opens camera.
2. Image EXIF-stripped, filename = `{uuid}.jpg` → presigned S3 upload.
3. Poll `/api/attempts/:id/status` until OCR + classification complete.

**COPPA compliance** (students are minors):
- No analytics SDKs that track PII (no GA4 user_id, no Amplitude).
- Only `student_uuid` in telemetry — never name, email, photo metadata.
- Session token stored in SecureStore (Expo) / httpOnly cookie (web) — never localStorage.

---

## [6] apps/web/(teacher) — Teacher dashboard

Platform: **Next.js 14 App Router** route group `(teacher)`, web-only (no mobile teacher en MVP).

Key views:
1. **Classroom overview**: heatmap of `p_known` per (student, skill). Color: green ≥0.7, yellow 0.4–0.7, red <0.4.
2. **Alerts panel**: unresolved `TeacherAlert` list. Mark resolved button.
3. **Student drill-down**: attempt history, error frequency chart per error type.
4. **Practice assignment**: teacher can trigger additional practice for student/group.

Data fetching:
- Server Components fetch from `innova-backend-serverless` API with `Authorization: Bearer` (Cognito JWT from cookies).
- Real-time alert badge: SWR polling every 60s (SSE post-MVP).
- Charts: `recharts` (lightweight, no D3 dependency for MVP).

---

## [7] apps/web/(parent) + apps/mobile-parent — Parent app

Web vive en `apps/web/(parent)` (Next.js). Mobile nativo vive en `apps/mobile-parent` (Expo).

Key flows:
1. View child's active `PracticeAssignment` — list of exercises to do.
2. See mastery progress summary (`p_known` bars per skill, no raw numbers shown).
3. Receive push notification when assignment is created (`expo-notifications`).
4. Tap exercise → opens `apps/practice` in-app or redirects to practice app.

---

## [8] packages/telemetry

- Buffer: `Map<string, TelemetryEvent[]>` keyed by `attempt_id`.
- Flush trigger: 2s debounce OR buffer size ≥50 OR `unload` event.
- Destination: `POST /api/telemetry` (batched, max 50 events per request).
- Schema: `TelemetryEvent { attempt_id, event_type, payload, timestamp_ms }` — no PII.
- **On failed flush**: retry 3× with exponential backoff; drop with local warning log after 3 failures.

---

## [9] packages/math-input

- Cross-platform: React Native component wrapping `expo-math-input` (custom).
- Web fallback: HTML input with `inputmode="decimal"` + virtual keypad overlay.
- Output: `StepInput { value: string, step_index: number, duration_ms: number }`.
- **No LaTeX rendering for student input** (MVP) — plain numeric strings. LaTeX rendering is for teacher error renderer only.
- Accessibility: large touch targets ≥44×44px, high contrast mode support.

---

## [10] Testing

- **Unit**: Vitest + React Testing Library. All shared packages have unit tests.
- **E2E**: Playwright (web flows for teacher + practice web). Run `pnpm -r run test:e2e`.
- **Mobile E2E**: Detox (post-MVP). For MVP, manual smoke test on iOS simulator + Android emulator.
- Coverage gate: **≥75%** for shared packages (`packages/*`). Apps have E2E smoke tests.

Critical E2E flows:
- Practice: submit 3-step attempt → verify attempt stored + mastery updated.
- Teacher: view classroom heatmap → mark alert resolved.
- Parent: view practice assignment → tap exercise.

See `docs/prompt/03-innova-clients-testing.md` for full test spec.

---

## [11] Environment variables (v7 Supabase)

```env
# apps/web (Next.js)
NEXT_PUBLIC_API_URL=https://api.superprofes.app
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only, NUNCA prefijo NEXT_PUBLIC_
NEXT_PUBLIC_S3_UPLOAD_BUCKET=

# Expo (apps/mobile-student, apps/mobile-parent)
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Deprecadas: `COGNITO_*`, `AMPLIFY_BRANCH`. Validadas en build via `packages/env` (`@t3-oss/env-nextjs` + Zod). **Las variables `NEXT_PUBLIC_*` se filtran al cliente** — `SUPABASE_SERVICE_ROLE_KEY` jamás debe ir con ese prefijo.

---

## [12] CI/CD

- `.github/workflows/ci.yml` — typecheck + lint + unit (Vitest) + **Playwright smoke** en PRs.
- `.github/workflows/deploy-web.yml` — Vercel deploy `apps/web` en merge a main (1 sólo job).
- `.github/workflows/deploy-mobile.yml` — EAS Build + EAS Update **bajo demanda** (trigger por tag `mobile-v*`, no en cada merge, para no quemar build minutes).
- Todos los workflows con `concurrency: { group: ${{github.workflow}}-${{github.ref}}, cancel-in-progress: true }`.
- Branch: `feature/<nombre>` → PR → 2 reviewers → merge.

### Smoke testing con Playwright MCP
Ver `docs/SMOKE_TESTING.md`. Cada PR de UI corre Playwright sobre el flujo afectado, captura screenshots y los compara contra `SuperProfes-Design-System/preview/<componente>.png` con tolerancia 5% (bajar a 2% cuando estabilice). Los agentes que toquen UI **deben** ejecutar el smoke vía Playwright MCP (lectura, no instalación) y adjuntar screenshot en el comentario del PR.

---

## [13] What NOT to do

- No `localStorage` for session tokens — usar `@supabase/ssr` (httpOnly cookies en web) / SecureStore (native).
- No third-party analytics que capture PII (COPPA + Ley 21.180).
- No Tauri desktop wrappers.
- No LaTeX rendering en student practice input (MVP).
- No `useEffect` para data fetching en Next.js App Router — usar async Server Components.
- No agregar features nuevas en `apps/practice|teacher|parent` (deprecadas, en proceso de borrado).
- No comandos de instalación / build / deploy desde el agente — ver §[0].
- No volver a Cognito ni a JWT custom — auth es Supabase de aquí en adelante.
