// render-og.mjs — rasterize the branded SVG sources into the PNGs that scrapers
// and legacy browsers need (OG card + apple-touch icons).
//
// Open Graph scrapers (Facebook, LinkedIn, WhatsApp, X) and iOS home-screen
// icons render PNG far more reliably than SVG, so we ship real rasters. This
// uses the Playwright Chromium that already backs the e2e smoke tests (no new
// dependency), loads the vendored Inter faces via @font-face for pixel-faithful
// type, and writes each asset into both the landing and web public dirs.
//
// Run:  node landing/scripts/render-og.mjs   (or, from landing/: node scripts/render-og.mjs)
//
// Fallback without Playwright (system fonts, needs librsvg):
//   rsvg-convert -w 1200 -h 630 landing/public/og-image.svg -o landing/public/og-image.png
//   cp landing/public/og-image.png apps/web/public/og-image.png

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const landingRoot = resolve(scriptDir, '..');
const repoRoot = resolve(landingRoot, '..');
const fontsDir = resolve(landingRoot, 'public/design-system/fonts');
const read = (rel) => readFileSync(resolve(repoRoot, rel), 'utf8');

const fontFace = (weight, file) =>
  `@font-face{font-family:'Inter';font-weight:${weight};src:url('file://${fontsDir}/${file}');}`;

const page = (svg, w, h) => `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFace(400, 'Inter-Regular.otf')}${fontFace(600, 'Inter-SemiBold.otf')}${fontFace(700, 'Inter-Bold.otf')}
*{margin:0;padding:0}html,body{width:${w}px;height:${h}px;overflow:hidden;background:transparent}
svg{display:block;width:${w}px;height:${h}px}</style></head><body>${svg}</body></html>`;

// [source svg, width, height, output paths relative to repo root]
const jobs = [
  ['landing/public/og-image.svg', 1200, 630, ['landing/public/og-image.png', 'apps/web/public/og-image.png']],
  ['landing/public/favicon.svg', 180, 180, ['landing/public/apple-touch-icon.png', 'apps/web/app/apple-icon.png']],
];

const browser = await chromium.launch();
try {
  const tab = await browser.newPage();
  for (const [src, w, h, outs] of jobs) {
    await tab.setViewportSize({ width: w, height: h });
    await tab.setContent(page(read(src), w, h), { waitUntil: 'networkidle' });
    await tab.evaluate(() => document.fonts.ready);
    const buffer = await tab.screenshot({
      type: 'png',
      omitBackground: true,
      clip: { x: 0, y: 0, width: w, height: h },
    });
    for (const out of outs) {
      const target = resolve(repoRoot, out);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, buffer);
      console.log('wrote', out);
    }
  }
} finally {
  await browser.close();
}
