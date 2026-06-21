# Admin Dashboard — UI kit

Internal-facing surface for ops and engineering. Monitors real-time inference health, controls killswitches, and tracks cloud spend.

## Audience

Engineering and operations (currently Víctor + technical collaborators). Never exposed to students, parents, or teachers.

## Palette

Inherits the **slate "grounded"** palette from the teacher surface — same neutral grays, same border/shadow tokens. Status semantics use the shared mastery scale: mint-500 for healthy, warning-bg/warning-fg for degraded, mastery-weak tints for error states.

## Screens

| File | What it shows |
|---|---|
| `status.html` | Live system status: KPI tiles (attempts/24h, rule-engine coverage, month-to-date cost), SQS queue depth, killswitches (SSM parameters), nightly calibration jobs, external API health |

## Component inventory

| Component | Description |
|---|---|
| `Spark` | Inline SVG sparkline — area fill + stroke, no axes |
| `Killswitch` (`.ks`) | Toggle card for LLM/OCR killswitches — mirrors `/innova/llm/paused` and `/innova/ocr/paused` in SSM |
| `.pill` | Status badge — `ok` (mint), `warn` (warning-bg), `err` (mastery-weak tint), `paused` (slate) |

## Token notes

- Cards use `--r-xl` (16px), not the tighter `--r-lg` of body rows — heavier data density benefits from slightly more rounding.
- KPI monospaced numbers: `ui-monospace, monospace` at 28px with `tabular-nums`.
- Sparklines: area at 12% opacity over the line; no axes, no labels — trend only.

## Open questions

- Auth gate: should this route behind Cognito `teachers` pool or a separate `ops` pool?
- Real-time updates: auto-refresh at 30s is mocked; wire to a `/admin/status` SSE endpoint when ready.
