# PLAN v9 — Addendum innova-clients

> v9 · 2026-06-10 · Supersede `PLAN_v8_ADDENDUM.md`.
> Master plan: `../../docs/MASTER_PLAN_v9.md`. ADRs: 116-125 (en especial **ADR-124**: Expo gateado por M27).
> **Regla #0:** `CLAUDE.md §0` — agente NO ejecuta `pnpm install/add/build`, `vercel`, `eas`, `playwright install`.

---

## Contexto: dónde estamos

🟡 **v7/v8 parcial:** `apps/web` unificada existe con route groups `(student)/(teacher)` en skeleton/mock; `(parent)/(admin)` sin código. `packages/api-client` recién creado (sin commitear en `feature/astro-expo`). Expo **no iniciado**. Middleware role-based: **verificar antes de C8** (prerequisito C1 v8).

🔴 **v9 nuevo (feature central):** flujo guías completo — profe sube PDF y revisa pauta; alumno responde quiz estilo Canvas con fotos; dashboards por rol con heatmap completo; **dos apps Expo** (alumno y apoderado).

Orden obligatorio (ADR-124): **C8 → C12 (web) cierran M24-M26 antes de iniciar C13-C14 (Expo, M28).** El piloto puede arrancar web-only.

---

## Packages compartidos (crear/actualizar primero — los consumen web y Expo)

| Package | Estado | Contenido |
|---|---|---|
| `packages/guide-core` | **NUEVO** | Tipos del dominio guía (re-export de api-client) + hooks React Query: `useGuide`, `useGuideStatusPolling` (5s), `useSubmissionPolling` (5s → backoff 15s tras 2 min), `useQuizProgress`. Compartido web/Expo. |
| `packages/latex` | **NUEVO** | Render KaTeX (web) / WebView KaTeX (Expo) + `<LatexEditor>` con preview en vivo para el wizard. |
| `packages/upload-scanner` | Planificado en v7, **se implementa AHORA** | Web: file input (`capture="environment"` en mobile-web). Expo: `expo-camera`. Común: EXIF-strip, compresión a ~1600px lado largo (controla tokens de visión), presigned PUT, multi-foto (1-3). |
| `packages/api-client` | Existente | Regenerar tipos post-S15 backend (`pnpm run codegen:api-client`). |
| `packages/error-catalog`, `packages/supabase`, `packages/ui`, `packages/design-tokens` | Existentes | Reuso directo. `packages/ui` suma: `QuestionStatusBadge`, `SubmissionStateChip`, `GuideTimeline`, `StudentQuestionMatrix`, `HeatmapCollapsedByUnit` (de C2 v8, ahora sí se construye). |

---

## Sprint C8 (M24 — Profesor: subir guía + estado)

- `apps/web/app/(teacher)/guides/page.tsx` — lista de guías por curso con badges de estado (`GuideStatus`), filtro por curso, CTA "Nueva guía".
- `apps/web/app/(teacher)/guides/new/page.tsx` — dropzone PDF → `POST /guides` → presigned PUT → `POST /guides/:id/ingest`. Validación client-side: PDF, ≤25MB, ≤40 páginas.
- `apps/web/app/(teacher)/guides/[guideId]/page.tsx` — timeline de estados (`UPLOADED → EXTRACTING → GENERATING_SOLUTIONS → REVIEW`) con `useGuideStatusPolling`; si `EXTRACTION_FAILED`/`GENERATION_FAILED`: mensaje accionable (`failureReason`) + botón re-intentar.

**DoD:** profe sube PDF golden en staging y llega visualmente a `REVIEW`.

---

## Sprint C9 (M24 — Wizard de revisión de pauta)

`apps/web/app/(teacher)/guides/[guideId]/review/page.tsx` — **la vista más crítica del MVP** (gate ADR-119):

- Layout 3 paneles:
  1. **Lista de preguntas** con badges: `NEEDS_REVIEW`, topic confidence (%), discrepancia con solucionario del PDF (`validationNotes`), `EXCLUDED`.
  2. **Enunciado** (KaTeX + figura si hay) — editable (`statementLatex`, `label`, `points`).
  3. **Pauta editable**: paso a paso con `<LatexEditor>` (preview en vivo), editar `final_answer`, marcar/desmarcar `checkpoint`, agregar `alt_path`. Guardar → `PATCH .../solution` (crea versión TEACHER_EDITED).
- Selector de **Topic**: cascada Unit → Topic del grado del curso, preseleccionado por LLM con % de confianza; confirmar o cambiar (ADR-122).
- Acciones por pregunta: **Aprobar** / **Excluir** / **Regenerar pauta**. Acción masiva: "Aprobar todas las ≥85%".
- **Publicar**: modal con `dueAt`, `maxResubmissions`, `showSolutionAfterGrade` → `POST /guides/:id/publish`. Bloqueado hasta que toda pregunta esté `APPROVED|EXCLUDED`.

**DoD:** smoke Playwright — guía golden llega a `PUBLISHED` editando 1 pauta y 1 topic en el camino.

---

## Sprint C10 (M24/M25 — Alumno: quiz estilo Canvas)

- `apps/web/app/(student)/guides/page.tsx` — guías pendientes/completadas con progreso (X de N preguntas entregadas) y dueAt.
- `apps/web/app/(student)/guides/[guideId]/page.tsx` — **quiz view**:
  - Sidebar de preguntas con estado por pregunta: ⬜ sin responder / 📤 subida / ⏳ corrigiendo / ✅❌ corregida. **Navegación libre** entre preguntas (estilo Canvas).
  - Por pregunta: enunciado (KaTeX + figura) + zona de upload (`packages/upload-scanner`, 1-3 fotos, preview, re-tomar) + botón "Entregar respuesta" → presigned PUTs + `POST .../complete`.
  - Post-entrega: estado "Corrigiendo… ~1 min" con `useSubmissionPolling`; **no bloquea** pasar a la siguiente pregunta.
  - Resultado inline al llegar `GRADED`: correcto/incorrecto, score, explicación pedagógica del error (`ErrorTag.remediation` vía `packages/error-catalog`), pauta solo si `showSolutionAfterGrade`. Veredicto `ILLEGIBLE`: mensaje "no pudimos leer tu desarrollo, vuelve a intentarlo con mejor luz" + re-entrega si quedan intentos.
- `apps/web/app/(student)/guides/[guideId]/results/page.tsx` — resumen **solo propio** (RF-10.1).

**DoD:** alumno entrega fotos en staging y ve "corrigiendo"; con backend S13 cerrado, ve su resultado <2 min.

---

## Sprint C11 (M25/M26 — Resultados profesor por guía)

- `apps/web/app/(teacher)/guides/[guideId]/results/page.tsx`:
  - Matriz `Student × Question` (`<StudentQuestionMatrix>`): verde correcto / rojo incorrecto / gris pendiente / amarillo `ILLEGIBLE`-`UNALIGNED` / 🕐 late.
  - Click en celda → drawer: foto(s) + transcripción + alineación contra pauta + errorTag asignado, con **override manual** (reusa el modal "Reportar otro error" del plan C4 v8: typeahead del catálogo + sugerir nuevo error → `POST /admin/error-tags` DRAFT).
  - Tab "Errores comunes": top-N error tags por pregunta con chips (`ErrorTagChip`) y % del curso.

**DoD:** profe revisa una entrega ilegible, corrige el tag a mano y el cambio queda persistido.

---

## Sprint C12 (M26 — Dashboards + apoderado web)

- **Heatmap completo (C2.3 v8, ahora en MVP):** `apps/web/app/(teacher)/courses/[courseId]/heatmap/page.tsx` — matriz `Student × Unit` (p_known promedio), click → drill-down `Student × Topic`, doble-click → attempts. Virtualizado con `@tanstack/react-virtual`. Filtros: errorTag, OA, guía.
- `apps/web/app/(teacher)/courses/[courseId]/students/[studentId]/page.tsx` — vista por alumno: mastery por unit, historial de guías, errores frecuentes.
- **Apoderado web (responsive-first — los apoderados entran por teléfono):**
  - `apps/web/app/(parent)/page.tsx` — selector de hijo (`GET /parent/children`).
  - `apps/web/app/(parent)/children/[studentId]/page.tsx` — resumen mastery por Unit (barras, **sin números crudos**, COPPA), últimas guías con estado, alertas suaves. Sin fotos ni detalle de pasos.

**DoD:** los 3 roles ven sus vistas con data real de staging; heatmap fluido con 35 alumnos × 8 units.

---

## Sprint C13 (M28 — Expo alumno) — **NO inicia antes de cerrar M27 (ADR-124)**

`apps/mobile-student` (Expo SDK vigente al inicio del sprint):

- Auth Supabase con SecureStore (nunca AsyncStorage para tokens).
- Lista de guías + quiz view (reusa `packages/guide-core` + `packages/latex` WebView).
- **Cámara nativa por pregunta** (`expo-camera` vía `packages/upload-scanner`): captura multi-foto, crop guiado, EXIF-strip, compresión, presigned PUT.
- Polling de corrección + resultados (mismos hooks que web).
- Builds: EAS **Android internal track primero**; iOS solo si la cuenta Apple Developer está resuelta.

---

## Sprint C14 (M28 — Expo apoderado)

`apps/mobile-parent`:

- Resumen por hijo (idéntico a parent web, vía packages compartidos).
- Push con `expo-notifications`: guía publicada (nueva tarea del hijo), guía corregida, alerta del profe. Registro de token → `POST /parent/devices`.
- EAS Android internal track.

---

## Sprint C15 (continuo — Smoke tests v9)

Agregar a `docs/SMOKE_TESTING.md`:

1. Profe: upload PDF → estado llega a `REVIEW`.
2. Wizard: editar 1 pauta + 1 topic → `PUBLISHED`.
3. Alumno: entregar foto → "corrigiendo" → resultado <2 min.
4. Profe: matriz de resultados + override de errorTag.
5. Heatmap: drill-down Unit → Topic → attempts.
6. Apoderado: resumen por hijo.
7. (Manual, M28) Expo: cámara → resultado; push de guía corregida.

Screenshots comparados contra `SuperProfes-Design-System/preview/v9/`.

---

## Backlog técnico v9

- [ ] Supabase Realtime para estado de submissions (reemplaza polling; post-MVP).
- [ ] i18n keys para el flujo guías (`packages/i18n`).
- [ ] Accessibility audit (`axe-core`) en quiz view y wizard.
- [ ] Offline-first en Expo alumno (cola local de fotos pendientes de subir) — post-MVP.
