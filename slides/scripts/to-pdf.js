#!/usr/bin/env node
/**
 * Export a deck to a landscape 16:9 PDF, one page per slide.
 *
 *   node to-pdf.js <deck.html> [out.pdf] [--theme light] [--size 1920x1080]
 *
 * Same output as pressing `p` in the browser and choosing Save as PDF; this just
 * does it without the dialog. Animations are frozen by the deck's own print CSS.
 * Charts are re-drawn for print, so they land as vector SVG, not screenshots.
 *
 * --size sets the viewport AND the page together (page inches = px / 96). LEAVE IT
 * ALONE unless you know why: the engine's print CSS pins `@page{size:1280px 720px}`
 * and `.slide{width:1280px;height:720px}`, so anything larger letterboxes the slide
 * inside a bigger sheet with white margins. Changing the output page size for real
 * means changing those print rules too. Default 1280x720 → 960x540pt pages.
 *
 * Merging with a PDF from elsewhere (e.g. a 1440x810pt Canva export) leaves two page
 * sizes in one file — cosmetic, and it disappears if the merge happens in Canva,
 * which normalises every imported page to the deck's own size.
 */
const path = require('path'), fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { console.error('playwright not resolvable here — see qa-render.js note'); process.exit(2); }

const args = process.argv.slice(2);
const deck = args.find(a => !a.startsWith('--'));
const out = args.filter(a => !a.startsWith('--'))[1] || deck.replace(/\.html$/, '.pdf');
const themeIdx = args.indexOf('--theme');
const sizeIdx = args.indexOf('--size');
if (!deck) { console.error('usage: node to-pdf.js <deck.html> [out.pdf] [--theme light] [--size 1920x1080]'); process.exit(2); }
const [pw, ph] = (sizeIdx > -1 ? args[sizeIdx + 1] : '1280x720').split('x').map(Number);
if (!pw || !ph) { console.error('--size must look like 1920x1080'); process.exit(2); }

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: pw, height: ph } });
  await page.goto('file://' + path.resolve(deck));
  if (themeIdx > -1) await page.evaluate(t => document.documentElement.dataset.theme = t, args[themeIdx + 1]);
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(600);
  /* page in inches must equal the viewport in CSS px, or the stage letterboxes */
  await page.pdf({ path: out, width: (pw / 96) + 'in', height: (ph / 96) + 'in',
    printBackground: true, pageRanges: '' });
  await browser.close();
  console.log(`${out} — ${(fs.statSync(out).size / 1048576).toFixed(1)} MB`);
})();
