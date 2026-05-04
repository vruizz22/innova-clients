# Practice App — UI kit

Student-facing mobile (Expo) + web (Next.js). Sky/mint palette, calming, no red.

## Surfaces (`Components.jsx`)

- **PracticeHeader** — home button, streak pill, XP pill
- **ProblemDisplay** — vertical math stack with column-aligned digits (uses `.math` utility)
- **Keypad** — 4-col 56px keys: 0–9, `,`, `+`, `−`, `⌫`, "Listo"
- **ScanCTA** — entry point to the worksheet scanner
- **ScannerView** — camera view with corner crop, processing spinner, EXIF-stripped reassurance
- **FeedbackCorrect** — encouraging, mint accent, "Siguiente"
- **FeedbackError** — soft amber panel with side-by-side step diff and human-readable error description

## Click-thru flow

1. **home** — see assigned practice, scan CTA
2. Tap "Resta con reserva" → **problem** screen
3. Type **27** with the keypad → **good** (FeedbackCorrect)
4. Or type **33** → **bad** (FeedbackError, BORROW_OMITTED_TENS)
5. Tap "Escanear cuaderno" → **scan** (idle → processing → done → good)

The tab strip above the iPhone frame jumps to any screen for demo purposes.
