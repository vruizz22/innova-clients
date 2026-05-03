---
name: superprofes-design
description: Use this skill to generate well-branded interfaces and assets for SuperProfes (a procedural-math-error detection platform for 3°–6° básico Chilean primary school), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key things to remember about SuperProfes:

- **es-CL primary**, English only for system identifiers.
- **Two palettes** — sky/mint for student surfaces (calming), slate for teacher/parent (grounded). Mastery scale: green ≥ 0.7, amber 0.4–0.7, rose < 0.4. Never alarm red.
- **Procedural errors are highlighted in soft amber**, never red. The error renderer always shows the *step diff* and explains *why*.
- **Tabular numerals always** for math. Use the `.math` utility class.
- **Touch targets ≥ 44px.** Math keypad keys are 56px.
- **Tone:** warm with students ("tú"), data-forward with teachers, reassuring + jargon-free with parents (no raw P(L_n) values).
- **No emoji in product UI.**
- **Logo:** custom Inter 700 wordmark, "Super" in slate-900 + "Profes" in sky-500. Use `assets/superprofes-logo.svg` (light) / `superprofes-logo-inverse.svg` (dark) / `superprofes-mark.svg` (standalone).
