# PLAN v8 — Addendum innova-clients

> v8 · 2026-05-18 · Supersede `PLAN_v7_ADDENDUM.md`.
> Master plan: `../../docs/MASTER_PLAN_v8.md`. ADRs: 109-115.
> **Regla #0:** `CLAUDE.md §0` — agente NO ejecuta `pnpm install/add/build`, `vercel`, `eas`, `playwright install`.

---

## Contexto: dónde estamos

🟡 **v7 parcialmente completado:** clientes siguen en 3 apps separadas. Migración a `apps/web` unificada NO se completó.

🔴 **v8 nuevo:**

- UI multi-grado para profesor (selector de courses por grade band).
- Heatmap colapsado por Unit + drill-down a Topic (necesario con 200+ topics K-12).
- Catálogo de ejercicios filtrable por Domain > Subdomain > Topic > Grade.
- Admin UI para revisar error catalog (drafts, deprecate, edit).
- Reporte de error desde attempt review (alumno o profe sugiere error no catalogado).

---

## Sprint C1 (finalizar M9 v7 — apps/web unificada)

Prerequisito para todo v8. Completar lo pendiente de v7 antes:

- [ ] Mover `apps/practice` → `apps/web/app/(student)/`.
- [ ] Mover `apps/teacher` → `apps/web/app/(teacher)/`.
- [ ] Mover `apps/parent` → `apps/web/app/(parent)/`.
- [ ] `middleware.ts` con role-based redirect.
- [ ] Borrar apps viejas + Vercel projects viejos.

Detalle en `PLAN_v7_ADDENDUM.md §S2-S4`.

---

## Sprint C2 (M18 — UI profesor multi-grado)

### C2.1 Selector de courses con grade band

`apps/web/app/(teacher)/courses/page.tsx`:

- Lista courses del profe agrupados por grade band:
  - Básica baja (G1-G4)
  - Básica alta (G5-G6)
  - 7°-8° básico
  - 1°-2° medio
  - 3°-4° medio
- Cada course muestra: nombre, grado, # alumnos, % attempts esta semana, # alertas activas.

### C2.2 Dashboard por course

`apps/web/app/(teacher)/courses/[courseId]/page.tsx`:

- Header: nombre course, grado, subject.
- Tabs: `Heatmap`, `Alumnos`, `Asignaciones`, `Alertas`.

### C2.3 Heatmap colapsado por Unit

`apps/web/app/(teacher)/courses/[courseId]/heatmap/page.tsx`:

- Vista default: matriz `Student × Unit` (no Topic). Una unit = una celda con `p_known` promedio.
- Color: verde ≥0.7, amarillo 0.4-0.7, rojo <0.4.
- Click en celda Unit → drill-down a Topics de esa Unit (matriz `Student × Topic`).
- Doble click en celda Topic → lista de attempts del student en ese topic.

Razón: con 200+ topics K-12, un heatmap completo no es legible.

### C2.4 Endpoints consumidos

- `GET /teacher/courses` → lista paginada con counts.
- `GET /teacher/courses/:id/heatmap-by-unit` → matriz `Student[] × Unit[]` con `p_known_avg`.
- `GET /teacher/courses/:id/units/:unitId/topics-mastery` → drill-down.

---

## Sprint C3 (M18 — Catálogo de ejercicios)

`apps/web/app/(teacher)/exercise-bank/page.tsx`:

Filtros:

- Domain (multiselect)
- Subdomain (depende de Domain)
- Grade (multiselect)
- Difficulty (slider: easy/medium/hard)
- Source (system / teacher_authored / llm_generated)

Cada Exercise card muestra: prompt, canonical solution, target error tags (chips), difficulty, # veces usado.

Acciones:

- **Asignar** → modal selecciona course/students → confirma.
- **Editar** (solo si `source=TEACHER_AUTHORED` y el profe es el author).
- **Solicitar variante LLM** → modal: "Generar 5 ejercicios similares con dificultad X" → LLM-generated entries quedan como DRAFT del profe.

---

## Sprint C4 (M18 — Attempt review con reportar error)

`apps/web/app/(teacher)/attempts/[attemptId]/page.tsx`:

- Muestra steps del alumno + canonical solution lado a lado.
- Muestra `error_tag` detectado (o "UNCLASSIFIED").
- Botón "**Reportar otro error**":
  - Modal con búsqueda fuzzy del catálogo (typeahead).
  - Si encuentra: profe selecciona y confirma → `PATCH /attempts/:id { error_tag_id }` (override).
  - Si no encuentra: "**Sugerir nuevo error**" → formulario:
    - Nombre (texto libre)
    - Descripción
    - Domain (select)
    - Subdomain (select dependiente)
    - Grado donde apareció
    - Diagnostic hint
  - Submit → `POST /admin/error-tags` con `status=DRAFT, source=FIELD_REPORTED`.
  - Toast: "Tu sugerencia fue enviada al equipo Innova para revisión".

---

## Sprint C5 (M18 — Admin UI error catalog)

`apps/web/app/(admin)/error-catalog/page.tsx` (solo `role=admin`):

Vista lista:

- Filtros: Domain, Status (ACTIVE/DRAFT/DEPRECATED), Source.
- Búsqueda por código o nombre.
- Sort por created_at, status.

Vista detalle:

- Editar todos los campos.
- Aprobar DRAFT → ACTIVE.
- Deprecar ACTIVE → DEPRECATED (con sucesor opcional).
- Ver attempts donde se ha asignado (último 30 días).

Comando para regenerar enum TS post-aprobación:

```bash
# (lo corre CI automáticamente al mergear migration, pero admin puede gatillarlo manual también)
pnpm run codegen:error-tags
```

---

## Sprint C6 (M13 v7 mobile pendiente)

Continúa plan v7 sin cambios:

- `apps/mobile-student` (Expo) con cámara para OCR.
- `apps/mobile-parent` (Expo) con push notifications.

Apple Developer Account decisión pendiente. Si no se aprueba: MVP mobile = Android only.

---

## Sprint C7 (smoke tests v8)

Agregar a `docs/SMOKE_TESTING.md`:

- **Course selector multi-grado:** profe con courses en G3 + G8 + G11M ve los 3 agrupados por grade band.
- **Heatmap drill-down:** click en cell Unit abre topics; doble click en cell Topic abre attempts.
- **Exercise bank filters:** seleccionar Domain=ALGEBRA + Subdomain=EQ_LINEAR + Grade=G8 retorna ≥10 exercises.
- **Reportar nuevo error:** modal abre, búsqueda fuzzy funciona, submit crea DRAFT.
- **Admin error catalog:** lista paginada, aprobar DRAFT actualiza status.

Cada test captura screenshot vs baseline en `SuperProfes-Design-System/preview/v8/`.

---

## Packages nuevos / actualizados

- `packages/error-catalog/` (NUEVO) — wrappers tipados del enum `error-tags.generated.ts` + helpers (`getDomainOf`, `isDeprecated`, `formatHumanName`).
- `packages/api-client/` — regenerar tipos del OpenAPI backend post-v8.
- `packages/ui/` — nuevos componentes:
  - `HeatmapCollapsedByUnit`
  - `ExerciseCard`
  - `ErrorTagChip`
  - `ErrorSearchTypeahead`
  - `GradeBandSelector`

---

## Backlog técnico v8

- [ ] Virtualizar la tabla del heatmap con `@tanstack/react-virtual` si un course tiene >100 alumnos.
- [ ] React Query (`@tanstack/react-query`) para caché del catálogo de error tags (refetch on focus, stale time 5min).
- [ ] Translation keys preparadas para i18n: catálogo de errores está en español pero el UI debe poder cambiar (`packages/i18n`).
- [ ] Accessibility audit con `axe-core` en flujos críticos (heatmap, exercise bank, attempt review).
