# fonts/

Inter Variable, the project font.

`inter.css` declares two `@font-face` rules (regular + italic) that try a local
`./InterVariable.woff2` first and fall back to rsms.me — the canonical Inter CDN
by the typeface author. To go fully offline-capable for production:

1. Download `InterVariable.woff2` and `InterVariable-Italic.woff2` from
   https://rsms.me/inter/ → "Download Inter".
2. Drop them in this folder.
3. Optionally remove the rsms.me fallback URL in `inter.css`.

License: SIL Open Font License 1.1 — https://github.com/rsms/inter/blob/master/LICENSE.txt
