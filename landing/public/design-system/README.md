# SuperProfes — Design System

> Design system for the **SuperProfes** client applications: a procedural-math-error detection platform for 3°–6° básico (Chilean primary school). Teachers see the *specific* error each student makes (e.g. `BORROW_OMITTED_TENS`) **before** the test, and the system auto-assigns focused practice.

Inspiration: DreamBox Learning + EstudIA, with a focus on the validated pain point of overcrowded classrooms (20 teacher interviews).

The product is shipped from the `vruizz22/innova-*` repos (legacy internal name). The user-facing brand is **SuperProfes**.

---

## Products in scope

This design system covers **five** client surfaces.

| Surface | Stack | Audience | Purpose |
|---|---|---|---|
| **Practice App** (`apps/practice`) | Next.js 14 (web) + Expo (mobile) | Students 3°–6° | Solve digital problems or upload worksheet photos; receive procedural feedback |
| **Teacher Dashboard** (`apps/teacher`) | Next.js 14 | Classroom teachers | Mastery heatmap, alerts panel, student drill-down, practice assignment |
| **Parent App** (`apps/parent`) | Expo | Parents | Mastery summary (no raw numbers), supervision flow, push notifications |
| **Landing** (`apps/landing`) | Next.js / Astro | Schools, parents (acquisition) | Public marketing site |
| **Admin Dashboard** (`apps/admin`) | Next.js 14 | Internal (ops) | System status, killswitches, queue health, cost tracking |

---

## Source materials

- **Brand:** SuperProfes — https://superprofes.app/ (not yet live at time of writing)
- **GitHub: [`vruizz22/innova-clients`](https://github.com/vruizz22/innova-clients)** — stub repo, no client code yet
- **GitHub: [`vruizz22/innova-backend-serverless`](https://github.com/vruizz22/innova-backend-serverless)** — NestJS backend; primary source for domain model, error types, and endpoints
- **GitHub: [`vruizz22/innova-ai-engine`](https://github.com/vruizz22/innova-ai-engine)** — Python ML workers (BKT, IRT, LLM classifier, OCR)
- Brand spec & UX guidelines provided directly by the user.
- Error taxonomy: `docs/error-taxonomy.md` in backend repo.

---

## Index

| File | What's in it |
|---|---|
| `README.md` | This document — context, content + visual foundations, iconography |
| `colors_and_type.css` | CSS custom properties: color palette, type scale, semantic tokens |
| `styles.css` | Entry point — `@import`s fonts + tokens; link this single file in consumers |
| `tokens.ts` / `index.ts` | TypeScript token layer — `SP_TOKENS` typed constants referencing CSS vars |
| `SKILL.md` | Skill manifest for Claude Code / Skills usage |
| `assets/superprofes-logo.svg` | Wordmark (light) |
| `assets/superprofes-logo-inverse.svg` | Wordmark (dark surface) |
| `assets/superprofes-mark.svg` | Standalone mark / favicon |
| `assets/illustrations/` | Flat 2-color empty-state illustrations |
| `assets/lucide-cdn.txt` | Icon-set substitution notes |
| `preview/` | Design-system cards rendered for the Design System tab |
| `ui_kits/teacher/` | Teacher Dashboard — 8 screens (index, alerts-inbox, assign-practice, attempt-detail, classrooms, items, skills, student-profile) |
| `ui_kits/practice/` | Practice App — 3 screens (index, web, ocr-upload) + PracticeComponents.jsx |
| `ui_kits/parent/` | Parent App — 3 screens (index, web, onboarding) + ParentComponents.jsx |
| `ui_kits/auth/` | Auth flows — 2 screens (index, mobile) |
| `ui_kits/admin/` | Admin Dashboard — System Status (killswitches, queues, cost) |
| `ui_kits/shared/` | Shared components: Icon, VisualErrorRenderer, ios-frame |
| `landing/` | Public landing page — full SEO/OG implementation |

---

## Design Principles

1. **Pedagogical empathy.** Minimize math anxiety for students; maximize scannability for over-burdened teachers.
2. **Accessibility-first.** All touch targets ≥ 44×44px; visible focus rings (2px offset); WCAG AA contrast.
3. **Privacy by design.** Visible reassurance that photo uploads are anonymized + EXIF-stripped. No third-party trackers, no session replays.
4. **Procedural, not punitive.** Errors are highlighted in **soft amber**, never red. Feedback explains *why* a step diverged from the canonical solution; it never grades or shames.
5. **Tabular by default.** All numeric content uses tabular-nums to keep vertical math (long subtraction, long division) pristine.

---

## Content Fundamentals

### Language

- **Primary language: Chilean Spanish (es-CL).** Marketing copy, student/parent feedback, teacher UI: all Spanish.
- **Technical/system identifiers: English.** Error type slugs (`BORROW_OMITTED_TENS`), API field names, backend code.
- **Bilingual lexicon:** `error_type` slugs are technical; the Visual Error Renderer translates each to a friendly Spanish phrase for students.

### Tone

- **For students:** warm, encouraging, *never* punishing. Use "tú", short sentences, present tense.
  - ✅ "Casi lo tienes — fíjate en la columna de las decenas."
  - ❌ "Incorrecto." / "Te equivocaste."
- **For teachers:** clear, professional, data-forward. Use "usted" or neutral. Lead with numbers and verbs.
  - ✅ "12 alumnos cometieron `BORROW_OMITTED_TENS` esta semana."
- **For parents:** reassuring, factual, no jargon. Use "tu hijo/a", avoid raw probabilities.
  - ✅ "Tu hijo va bien en sumas. Esta semana practicó 4 días."
  - ❌ "P(L_n) = 0.74 en addition_carry"

### Casing

- **Sentence case** for buttons, labels, tabs.
- **Title case** rarely — only product name "SuperProfes" and proper nouns. The "P" stays capital inside the wordmark.
- **UPPERCASE** reserved for short status badges (max 12 chars): `EN RIESGO`, `RESUELTO`, `NUEVO`.

### Emoji & special characters

- **No emoji** in product UI.
- **Math glyphs are first-class:** `+`, `−` (U+2212), `×`, `÷`, `=`, `<`, `>`, `≤`, `≥`. Always Unicode minus, not hyphen-minus.
- **Fractions:** stack vertically, never `½` ligatures.

---

## Visual Foundations

### Color

Two parallel palettes — *calming* sky/mint for student surfaces, *grounded* slate for teacher/parent dashboards. Both share the semantic mastery scale.

- **Student palette.** Soft sky blues + mint greens. Backgrounds `#F0F7FB` (sky-50), `#ECFAF3` (mint-50). Primary action `#3FA7D6` (sky-500). Highest-contrast text `#0F2A3D`.
- **Teacher palette.** Cool slate grays. Surfaces `#F7F8FA`, `#E5E9F0`. Text `#1F2937`. Accent kept neutral; data is the visual hero.
- **Mastery scale.** Green ≥ 0.7 (`#3DAA72`), amber 0.4–0.7 (`#E8A33D`), rose < 0.4 (`#D86060`). Rose is intentional — less punitive than alarm red.
- **Procedural error.** `#FFF4DB` bg + `#7A4F00` fg. Strictly avoid aggressive reds.
- **Focus ring.** sky-500, 2px solid + 2px offset.

### Type

- **Family:** Inter Variable. 400/500/600/700, with `font-feature-settings: "tnum" 1, "cv11" 1, "ss01" 1`. Tabular numerals are non-negotiable.
- **`.math` utility:** locks `font-variant-numeric: tabular-nums slashed-zero` plus 0.02em letter-spacing.
- **Scale:** display 48 / 36 / 28 — heading 22 / 18 — body 16 / 14 — caption 12.

### Spacing & layout

- **Base 4px.** Scale 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80.
- **Touch targets ≥ 44px.** Math keypad keys 56px on phone, 64px on tablet.
- **Grid.** Teacher: 12-col, 1280px max. Student: single 640px column, centered.

### Backgrounds, motion, hover/press

- **Mostly flat.** No full-bleed photography in product UI; reserved for the landing hero.
- **No gradients in product surfaces.** Marketing landing may use one subtle sky-to-mint gradient on the hero block (15% opacity overlay only).
- **Animation.** Standard ease `cubic-bezier(0.2, 0.8, 0.2, 1)`, 180ms. Mastery cell color transitions 240ms ease-in-out. Page transitions opacity-only fade 120ms; never slide.
- **Hover (web):** primary buttons darken 8%; secondary buttons add 4% slate bg.
- **Press:** `transform: scale(0.98)` over 80ms. No click ripple.
- **Disabled:** 40% opacity, no pointer events.

### Borders, shadows, radii

- **Border:** 1px slate-100. Never thicker in product UI.
- **Radius:** 4 / 8 / 12 / 16 / 24 / pill. Cards = 12. Buttons = 8. Math keys = 12. Overlays / modals = 24.
- **Shadows.** Two only — `--shadow-card` (resting) and `--shadow-pop` (overlay).
- **No inner shadows, no glassmorphism** except the camera viewfinder safe-area chrome (`backdrop-filter: blur(8px)`).

### Cards

- 12px radius, 1px slate-100 border, white bg, `shadow-card` resting.
- Padding 20 / 24 / 32px depending on density.
- **No left-border accent stripes.** They read as alert; reserve that semantics for actual alerts.

### Imagery vibe

When real photography appears (landing only): warm-cool balanced, classroom-authentic, daylight, slight grain ok. Children's faces blurred or shot from angles per privacy stance.

---

## Iconography

- **Primary set: Lucide.** Stroke-based, 1.5px stroke, 24px default. Linked from CDN — see `assets/lucide-cdn.txt`. Substituted because `innova-clients` has no committed icon set.
- **Sizes:** 16 (inline body), 20 (inline heading), 24 (default), 32 (feature blocks).
- **Color:** inherit `currentColor`. No multi-color icons.
- **Math symbols are typographic, not iconographic.**
- **No emoji, no unicode glyphs as icons** (no ★, no ▲ — use Lucide `star` instead).
- **Logos:** SuperProfes wordmark is custom Inter 700 (`-0.025em`) with "Super" in slate-900 and "Profes" in sky-500. Standalone mark is a stack of 3 progress-bar lines (sky-500 + mint-500), drawn as SVG in `assets/superprofes-mark.svg`.
- **Brand illustrations:** flat 2-color (sky + mint), used in student empty states only.

---

## Open issues / iteration asks

1. **Reconciled ✓** — `innova-clients` now has a real implementation. All screens imported and TS token layer aligned with CSS.
2. **Inter via Google Fonts.** Self-host whenever you have `.woff2` files.
3. **Lucide as substitute icon set.** Swap to your final choice when ready.
