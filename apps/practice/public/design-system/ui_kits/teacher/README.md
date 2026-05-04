# Teacher Dashboard — UI kit

What a classroom teacher sees. Built for fast triage of overcrowded classes.

## Surfaces

- **Top bar** — brand · search · alerts bell · settings · avatar (`Chrome.jsx`)
- **Sidebar** — Resumen / Mastery / Alertas (badge) / Alumnos / Asignar práctica (`Chrome.jsx`)
- **Stat row** — 4 KPI cards: mastery promedio, en riesgo, alertas, práctica asignada (`StatRow.jsx`)
- **Mastery heatmap** — students × skills with `p_known` cells (`MasteryHeatmap.jsx`)
- **Alerts panel** — `AT_RISK_SKILL`, `COMMON_ERROR_DETECTED`, `STUDENT_DROP` with resolve action (`Alerts.jsx`)
- **Student drill-down** — modal panel with mastery, sparkline, error frequency, assign-practice CTA (`StudentDrillDown.jsx`)

## Click-thru flow demonstrated by `index.html`

1. Land on dashboard.
2. Click any heatmap cell → opens student drill-down modal.
3. Click "Resolver" on any alert → it disappears and the badge updates.

## Dev notes

- Single-file React (Babel in browser). No build needed.
- Icons are the inline `Icon` component (Lucide-derived SVGs).
- All copy is es-CL.
