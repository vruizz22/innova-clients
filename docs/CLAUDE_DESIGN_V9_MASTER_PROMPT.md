# Claude Design — Master Prompt v9 (SuperProfes / Innova)

> Pega el bloque entre `===` directamente en Claude Design. Está escrito para que el
> modelo **lea los 3 repos**, entienda el dominio v9 (pipeline de guías) y entregue el
> sistema de pantallas completo, responsive-first, usando el design system existente.
> Generado 2026-06-11. Fuente: `docs/MASTER_PLAN_v9.md`, `docs/PLAN_v9_ADDENDUM.md`, ADRs 116-125.

---

```
===================================================================
CLAUDE DESIGN — BRIEF MAESTRO · SuperProfes (Innova) · Producto v9
===================================================================

## 0. TU ROL
Eres el diseñador de producto senior de SuperProfes, una EdTech chilena de
detección de errores procedimentales en matemática (3° básico → 4° medio, K-12).
Vas a diseñar el sistema COMPLETO de pantallas del MVP v9 ("pipeline de guías"),
responsive-first (los apoderados y muchos alumnos entran por teléfono), reutilizando
estrictamente el design system existente. Diseña al máximo nivel: cada pantalla con
todos sus estados (vacío, cargando, error, parcial, éxito), por rol, con redlines y
tokens. Español en UI; inglés solo en nombres de capas/tokens.

## 1. ACCESO A LOS REPOS (LÉELOS ANTES DE DISEÑAR)
Tienes acceso de lectura a los 3 repos. Mapa de lo que DEBES leer:

FRONTEND — `innova-clients/` (rama `feature/astro-expo`)
> ⚠️ EL FLUJO v9 YA ESTÁ IMPLEMENTADO EN WEB (C8–C12). NO partes de cero: tu trabajo es
> ELEVAR el diseño de pantallas que ya existen y funcionan contra la API real. Léelas,
> respeta su estructura/markup/estados, y propón la versión pulida (jerarquía, ritmo,
> microinteracciones, densidad, mobile). Las únicas pantallas "en blanco" son las de Expo (C13/C14).
- `docs/PLAN_v9_ADDENDUM.md` ......... sprints C8–C15 con cada pantalla y su DoD (FUENTE PRIMARIA de alcance).
- `packages/design-tokens/src/` ...... COLORS, spacing, typography, shadows, breakpoints (ÚNICA fuente de color/espaciado).
- `packages/error-catalog/src/` ...... taxonomía de errores, dominios, grados, `formatHumanName`, grade-bands, remediation.
- `packages/ui-components/src/` ...... componentes que YA EXISTEN y debes reusar/extender (ver §4).
- `packages/api-client/src/{guides,schemas,client}.ts` ... CONTRATO REAL de datos v9 (tipos exactos que pinta cada pantalla; los nombres de campos del UI salen de aquí).
- Pantallas v9 YA CONSTRUIDAS (lee y eleva — son tu baseline):
    PROFE  `app/(teacher)/guides/page.tsx` · `.../guides/new/page.tsx` · `.../guides/[guideId]/page.tsx`
           `.../guides/[guideId]/review/page.tsx` · `.../guides/[guideId]/results/page.tsx`
           `.../courses/[courseId]/heatmap/page.tsx` · `.../courses/[courseId]/students/[studentId]/page.tsx`
    ALUMNO `app/(student)/guides/page.tsx` · `.../guides/[guideId]/page.tsx` · `.../guides/[guideId]/results/page.tsx`
    APODER `app/(parent)/family/page.tsx` · `app/(parent)/family/[studentId]/page.tsx`
- Componentes v9 reales (patrones de UI a respetar/pulir):
    `components/guides/{GuideUploader,GuideDetailView,status,ReviewWizard,QuizView,MathPhotoUploader,ResultsMatrix}.tsx`
    `components/heatmap/CourseHeatmapView.tsx` · `components/latex/{Latex,LatexEditor}.tsx`
    `components/practice/{SolveExercise,ScanFlow,FeedbackPanel,ReportErrorPanel}.tsx` (v8, reusa su lenguaje visual)
    `components/teacher/DashboardClient.tsx` · `lib/mastery-color.ts` (umbrales de banda)
- `SuperProfes-Design-System/` ....... brand, voz, iconos, ui_kits/{auth,practice,teacher,parent,admin,shared}, preview/v9/*.html (baseline visual a comparar).

BACKEND — `innova-backend-serverless/` (rama `feature/plan_V8`)
- `prisma/schema.prisma` ............. modelo de datos y enums (los badges salen de aquí, ver §3): `Guide`, `GuideQuestion`, `GuideSolution`, `GuideSubmission` (+ campos `overrideErrorTagId/overrideById/overrideAt`), `StudentTopicMastery`, `TeacherAlert`, `ParentLink`.
- `src/modules/guides/guides.service.ts` ... contrato real: `getResultsMatrix` (matriz Alumno×Pregunta + errores comunes + late), `getSubmissionDetail` (fotos presigned + transcripción + alineación), `overrideSubmissionErrorTag`.
- `src/modules/mastery/mastery.service.ts` .. `getCourseHeatmap` (Alumno×Unidad, p_known promedio).
- `src/modules/parent/parent.service.ts` .... `listChildren`, `getChildSummary` (COPPA: bandas `low|mid|high`, NUNCA números crudos — el apoderado NO recibe p_known).
- `src/modules/{attempts,alerts,classrooms}/` ... resto de contratos (C4 reportar error, alertas, cursos).

AI-ENGINE — `innova-ai-engine/`
- `.github/instructions/06c-guide-pipeline.md` ... pipeline de guías end-to-end (etapas, gates, contratos de mensaje).
- `docs/PLAN_v9_ADDENDUM.md` ......... modelos y latencias por etapa (definen los tiempos de espera y los mensajes "corrigiendo ~1 min").
- Workers reales: `guide_ingest_worker` (PDF → extract Sonnet → figuras) y el worker de visión (foto → transcribe+alinea Haiku) → de ahí salen los veredictos `ILLEGIBLE/UNALIGNED` y los estados que la UI espera.

Si un dato no está en los repos, NO lo inventes: márcalo como supuesto en una nota de la pantalla.

## 2. PRODUCTO v9 EN UNA FRASE
"El profe sube su guía en PDF → la IA genera la pauta → el profe la revisa y publica
→ el alumno responde tipo Canvas subiendo FOTOS de su desarrollo manuscrito por
pregunta → la IA transcribe, alinea contra la pauta y detecta el error → el alumno ve
SOLO lo suyo, el profe lo ve para todo el curso por unidad/alumno, el apoderado por hijo."

Pipeline (asíncrono, el alumno/profe esperan con polling, NUNCA se bloquea la UI):
PDF → [Sonnet 4.6 extrae] → REVIEW (gate humano obligatorio) → PUBLISHED →
foto alumno → [Haiku 4.5 vision transcribe+alinea ~<90s p95] → GRADED → dashboards.

## 3. CONTRATOS DE ESTADO (los badges/animaciones DEBEN reflejar estos enums REALES)
GuideStatus:           UPLOADED → EXTRACTING → GENERATING_SOLUTIONS → REVIEW → PUBLISHED → ARCHIVED
                       (+ ramas de error: EXTRACTION_FAILED, GENERATION_FAILED → mensaje accionable + reintentar)
GuideQuestionStatus:   EXTRACTED, NEEDS_REVIEW (confianza baja), APPROVED, EXCLUDED
SolutionSource:        PDF_PROVIDED, LLM_GENERATED, TEACHER_EDITED  (mostrar procedencia de la pauta)
SubmissionStatus:      UPLOADED → TRANSCRIBING → GRADING → GRADED  (+ FAILED)
Veredictos de corrección por entrega: correcto / incorrecto / ILLEGIBLE / UNALIGNED / late.
Topic confidence: ≥0.85 se pre-aprueba; <0.85 = NEEDS_REVIEW (badge ámbar con %).
Pauta canónica = pasos LaTeX con `checkpoint:true` + `alt_paths` (el desarrollo del
alumno casi nunca sigue la pauta literal: diseña la alineación contra checkpoints,
no paso-a-paso estricto).

## 4. DESIGN SYSTEM — REUSA, NO REINVENTES
Tokens (de `packages/design-tokens`): primary = sky/azul (#0ea5e9 = primary-500,
foco alumno), secondary = verde (#22c55e, analítica profe), accent = ámbar/naranja
(#f97316, gamificación/atención). Usa SOLO la escala 50–900 de estos tokens + los
semantic/mastery. Mastery heatmap: verde ≥0.7, amarillo 0.4–0.7, rojo <0.4.
Componentes que YA existen y debes componer (no rediseñar desde cero):
  Button, Card, Badge, Input, MasteryBar, MasteryCell, AlertCard,
  GradeBandSelector, ErrorTagChip, ExerciseCard, ErrorSearchTypeahead,
  HeatmapCollapsedByUnit, e iconos stroke (Bell, Camera, BookOpen, BarChart3,
  AlertTriangle, TrendingDown, Users, CheckCircle, ChevronRight, Search, etc.).
Componentes NUEVOS v9 que debes diseñar (y que el equipo construirá en `packages/ui`):
  QuestionStatusBadge, SubmissionStateChip, GuideTimeline, StudentQuestionMatrix,
  LatexEditor (editor con preview KaTeX en vivo), MathPhotoUploader (1–3 fotos,
  preview, re-tomar), GuideQuestionSidebar (navegación estilo Canvas).
Tipografía y voz: cálida, clara, alentadora con el alumno ("¡Casi lo tienes!",
"No te rindas — equivocarse es parte de aprender"); precisa y accionable con el profe.
Toca objetivos ≥44×44px, alto contraste, modo lectura cómoda (math en tabular-nums).

## 5. PANTALLAS A ENTREGAR (todas, todos los estados, responsive)
Diseña agrupado por sprint. Para cada pantalla: desktop + mobile, y estados
vacío/cargando/error/parcial/éxito.
> Pantallas 1–12 (web, C8–C12) YA ESTÁN CONSTRUIDAS — entrégame la versión ELEVADA de
> cada una (parte del markup real, no de cero). Pantallas 13–14 (Expo) son greenfield.

PROFE (web, responsive) — C8/C9/C11/C12
1. Guides list — `(teacher)/guides`: lista por curso, badge GuideStatus, filtro por
   curso, CTA "Nueva guía".
2. New guide — `(teacher)/guides/new`: dropzone PDF (PDF, ≤25MB, ≤40 págs, validación
   client-side, errores claros), progreso de subida, transición a estado UPLOADED.
3. Guide detail/timeline — `(teacher)/guides/[id]`: GuideTimeline
   (UPLOADED→EXTRACTING→GENERATING_SOLUTIONS→REVIEW) con polling; ramas FAILED con
   `failureReason` + botón reintentar.
4. **Wizard de revisión** — `(teacher)/guides/[id]/review` (PANTALLA MÁS CRÍTICA, gate ADR-119):
   layout 3 paneles → (a) lista de preguntas con QuestionStatusBadge + topic confidence%
   + discrepancia con solucionario (validationNotes) + EXCLUDED; (b) enunciado KaTeX +
   figura, editable (statementLatex, label, points); (c) pauta editable con LatexEditor
   (preview vivo), final_answer, checkpoints, alt_paths. Selector de Topic en cascada
   Unit→Topic preseleccionado por LLM con %. Acciones por pregunta: Aprobar / Excluir /
   Regenerar pauta + acción masiva "Aprobar todas ≥85%". Botón Publicar (modal: dueAt,
   maxResubmissions, showSolutionAfterGrade) bloqueado hasta que toda pregunta sea
   APPROVED|EXCLUDED. Diseña los micro-estados de guardado (crea versión TEACHER_EDITED).
5. Guide results — `(teacher)/guides/[id]/results`: StudentQuestionMatrix (verde/rojo/
   gris/ámbar ILLEGIBLE-UNALIGNED/🕐 late). Click celda → drawer: foto(s) + transcripción
   + alineación vs pauta + errorTag asignado, con override manual (reusa el modal
   "Reportar otro error": typeahead del catálogo + sugerir nuevo error). Tab "Errores
   comunes": top-N errorTags por pregunta con ErrorTagChip + % del curso.
6. Heatmap — `(teacher)/courses/[id]/heatmap`: matriz Student×Unit (p_known promedio),
   click → drill-down Student×Topic, doble-click → attempts. Virtualizado (35×8 fluido).
   Filtros: errorTag, OA, guía.
7. Student drill-down — `(teacher)/courses/[id]/students/[sid]`: mastery por unit,
   historial de guías, errores frecuentes.

ALUMNO (web responsive + Expo después) — C10/C13
8. Guides list — `(student)/guides`: pendientes/completadas, progreso (X de N entregadas), dueAt.
9. **Quiz view** — `(student)/guides/[id]`: GuideQuestionSidebar con estado por pregunta
   (⬜ sin responder / 📤 subida / ⏳ corrigiendo / ✅❌ corregida), navegación LIBRE estilo
   Canvas. Por pregunta: enunciado (KaTeX + figura) + MathPhotoUploader (1–3 fotos, preview,
   re-tomar) + "Entregar respuesta". Post-entrega: estado "Corrigiendo… ~1 min" con polling,
   QUE NO BLOQUEA pasar a la siguiente. Resultado inline al GRADED: correcto/incorrecto,
   score, explicación pedagógica del error (remediation del catálogo), pauta solo si
   showSolutionAfterGrade. Veredicto ILLEGIBLE: "no pudimos leer tu desarrollo, vuelve a
   intentarlo con mejor luz" + re-entrega si quedan intentos.
10. Results propios — `(student)/guides/[id]/results`: resumen SOLO del propio alumno.

APODERADO (web responsive-first; entran por teléfono) — C12/C14
11. Child selector — `(parent)/family`: selector de hijo (cards).
12. Child summary — `(parent)/family/[studentId]`: resumen mastery por Unit en BARRAS de
    BANDA `low|mid|high`, **sin números crudos** (COPPA + Ley 21.719), últimas guías con
    progreso (X de N), alertas suaves por severidad. SIN fotos ni detalle de pasos.

MOBILE (Expo, C13/C14 — diseña las mismas vistas adaptadas a nativo)
13. Alumno: lista de guías + quiz view con **cámara nativa** por pregunta (captura multi-foto,
    crop guiado), polling, resultados.
14. Apoderado: resumen por hijo + estados de push (guía publicada / corregida / alerta).

## 6. REGLAS UX DURAS (no negociables)
- Asíncrono ≠ bloqueante: en quiz y wizard, esperar NUNCA congela la pantalla. Diseña el
  estado "trabajando" como acompañamiento, no como modal que atrapa.
- Gate humano: nada de la pauta es visible al alumno antes de PUBLISHED. El wizard debe
  hacer sentir el peso de "esto lo verán tus alumnos" sin fricción innecesaria.
- Alineación tolerante: el desarrollo del alumno es desordenado; los resultados muestran
  "dónde se desvió" (checkpoint), no un diff línea a línea rígido.
- Privacidad apoderado: barras de progreso, lenguaje cualitativo, cero PII de otros,
  cero fotos. Telemetría solo con UUID.
- Accesibilidad: foco visible, contraste AA, targets ≥44px, errores con texto + ícono
  (no solo color), soporte de lectura matemática.

## 7. ENTREGABLES Y FORMATO
- Frames Figma/Claude Design organizados por rol y sprint (C8…C14), nombrados
  `v9/{role}/{screen}/{state}` para mapear 1:1 contra `SuperProfes-Design-System/preview/v9/`.
- Cada pantalla: variante desktop + mobile, y los estados de §5.
- Redlines con tokens reales (nombres de `design-tokens`, no hex sueltos) y spacing en la escala.
- Un "component sheet" para los 8 componentes nuevos de §4 con sus props/estados.
- Un flow map (mermaid o board) por rol que conecte las pantallas con los estados de §3.
- Notas de supuestos donde el dato no exista en los repos.

## 8. CRITERIOS DE ACEPTACIÓN (alineados al DoD del master plan)
- Profe: subir PDF → wizard (editar 1 pauta + 1 topic) → PUBLISHED, sin callejones sin salida.
- Alumno: entregar foto → "corrigiendo" no bloqueante → resultado con explicación del error.
- Profe: matriz de resultados + override de errorTag; heatmap con drill-down Unit→Topic→attempts.
- Apoderado: resumen por hijo sin números crudos ni fotos.
- Todo compone los componentes existentes y respeta tokens; los nuevos quedan especificados.

## 9. NO-GOALS (no diseñes esto ahora)
- LaTeX en el INPUT del alumno (el alumno sube fotos, no escribe LaTeX; KaTeX es solo
  para enunciados/pauta del profe).
- Realtime/websockets (es polling en MVP).
- Pantallas de admin del catálogo de errores más allá de lo ya existente.
- Pagos, onboarding de colegio, o i18n (post-MVP).

Empieza leyendo `innova-clients/docs/PLAN_v9_ADDENDUM.md` y el `prisma/schema.prisma`
del backend; luego entrégame primero el flow map por rol y el component sheet, y
después las pantallas sprint por sprint (C8 → C14).
===================================================================
```

---

## Cómo usar este prompt

1. Asegúrate de que Claude Design tenga acceso de lectura a los 3 repos (o adjunta los
   archivos citados en §1 si trabaja por upload).
2. Pega el bloque entre `===`.
3. Pídele primero el **flow map + component sheet**, revisa, y luego avanza sprint por
   sprint. No pidas las 14 pantallas en un solo disparo: el resultado pierde fidelidad.
4. Compara cada frame contra `SuperProfes-Design-System/preview/v9/` (smoke visual, §C15
   del addendum). Los nombres `v9/{role}/{screen}/{state}` están pensados para ese diff.
