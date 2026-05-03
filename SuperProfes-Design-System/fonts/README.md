Inter fonts for SuperProfes

Place `InterVariable.woff2` here if you prefer the variable font. The repository already vendors several OTF static files (Regular/Italic/Medium/SemiBold/Bold).

To auto-download a variable font into this folder, from the repo root run:

```bash
INTER_VARIABLE_URL=https://example.com/InterVariable.woff2 ./scripts/download-fonts.sh
```

If you don't want to download automatically, upload a `InterVariable.woff2` file into this folder before deployment.
# fonts/

Inter, the project font.

This folder vendors static OTF files copied from the system Inter install:

- `Inter-Regular.otf`
- `Inter-Italic.otf`
- `Inter-Medium.otf`
- `Inter-MediumItalic.otf`
- `Inter-SemiBold.otf`
- `Inter-SemiBoldItalic.otf`
- `Inter-Bold.otf`
- `Inter-BoldItalic.otf`

`inter.css` points only to local files, so the Design System does not depend on
an external font CDN at runtime.

License: SIL Open Font License 1.1 — https://github.com/rsms/inter/blob/master/LICENSE.txt
