# CLAUDE.md — innova-clients

> Repo-specific instructions for Claude Code. Inherits all rules from `~/.claude/CLAUDE.md`.
> Stack: Turborepo + pnpm + Next.js 14 (App Router) + Expo SDK 51 + Astro + TypeScript strict.

---

## [1] Domain context

This monorepo contains all **client-facing applications** for Innova EdTech:

| App | Platform | Users | MVP |
|-----|----------|-------|-----|
| `apps/practice` | Web + Mobile (Expo web + Expo native) | Students | ✅ |
| `apps/teacher` | Web only (Next.js) | Teachers | ✅ |
| `apps/parent` | Web + Mobile (Expo web + Expo native) | Parents | ✅ |
| `apps/landing` | Web only (Astro) | Public | ✅ |
| `apps/practice-desktop` | Tauri (desktop wrapper) | Students | ❌ post-MVP |
| `apps/parent-desktop` | Tauri (desktop wrapper) | Parents | ❌ post-MVP |

---

## [2] Turborepo + pnpm conventions

- **Package manager: `pnpm` ONLY** (workspace protocol `pnpm-workspace.yaml`).
- Root: `pnpm -r run test`, `pnpm -r run build`, `pnpm --filter apps/teacher dev`.
- Shared packages in `packages/`:
  - `packages/math-input` — custom math keyboard + step input component (web + native).
  - `packages/upload-scanner` — camera capture + presigned S3 upload (web + native).
  - `packages/telemetry` — attempt buffer with 2s flush interval, SQS-via-API.
  - `packages/api-client` — typed API client generated from OpenAPI spec.
  - `packages/error-renderer` — renders classified error with visual step diff.
  - `packages/ui` — shared design system (Tailwind tokens, shadcn/ui base).
- Never use `npm` or `yarn` — Turborepo pipeline depends on pnpm lockfile.

---

## [3] Deploy strategy: AWS Amplify (primary) + Cloudflare CDN

**Decision: AWS Amplify for Next.js apps, Expo EAS for mobile builds, Cloudflare for Astro landing.**

Rationale (vs Vercel):
- Amplify Gen 2 supports SSR/ISR, App Router, Streaming natively with zero config.
- Stays within AWS ecosystem (same Cognito, same SQS, same IAM — no cross-cloud auth complexity).
- Free tier: 1000 build minutes/month + 15 GB storage + 5 GB data out/month → covers MVP pilot.
- Vercel is better DX but costs $20+/month per team + adds external vendor dependency.
- Astro landing: Cloudflare Pages (free tier, global CDN, zero cold start for static).
- Expo apps: EAS Build + EAS Update for OTA. TestFlight (iOS) + Play Console internal track (Android).

**Production URLs:**
- `practice.innova.cl` → Amplify (Next.js)
- `profe.innova.cl` → Amplify (Next.js)
- `apoderado.innova.cl` → Amplify (Next.js)
- `innova.cl` → Cloudflare Pages (Astro)
- iOS/Android → Expo EAS

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

## [5] apps/practice — Student practice app

Platform: **Expo (web + iOS + Android)** using Expo Router (file-based routing).

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

## [6] apps/teacher — Teacher dashboard

Platform: **Next.js 14 App Router** (web only, no mobile requirement for MVP).

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

## [7] apps/parent — Parent app

Platform: **Expo (web + iOS + Android)** using Expo Router.

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

## [11] Environment variables

```env
# apps/practice, apps/teacher, apps/parent (Next.js)
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
NEXT_PUBLIC_S3_UPLOAD_BUCKET=

# Expo (apps/practice, apps/parent)
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_COGNITO_CLIENT_ID=

# Build-time only (server)
AMPLIFY_BRANCH=
```

Validated at build time via `packages/env` using `@t3-oss/env-nextjs` (Zod schemas).

---

## [12] CI/CD

- GitHub Actions: `.github/workflows/ci.yml` — type-check + lint + unit tests on all PRs.
- `.github/workflows/deploy-web.yml` — deploy to AWS Amplify on merge to main.
- `.github/workflows/deploy-mobile.yml` — EAS Build + EAS Update on merge to main.
- Branch: `feature/framework` → PR → 2 reviewers → merge.

---

## [13] What NOT to do

- No Vercel-specific features (`next/headers` server-only APIs are fine since Amplify supports App Router).
- No `localStorage` for session tokens — use httpOnly cookies (web) / SecureStore (native).
- No third-party analytics that capture PII (COPPA + Ley 21.180 compliance).
- No desktop Tauri apps in MVP — create the route/folder but don't wire it up.
- No LaTeX rendering in student practice input (MVP scope).
- No `useEffect` for data fetching in Next.js App Router — use async Server Components.
