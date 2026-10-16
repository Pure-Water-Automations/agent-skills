#!/usr/bin/env node
/**
 * Free stock photography for slides, via Pexels. The zero-cost alternative to
 * gen-art.js — reach for this when the slide wants a REAL place, object, texture
 * or crowd, and for anything shipping on no budget.
 *
 *   # 1. look: print candidates (no download)
 *   node fetch-photo.js --query "empty auditorium seats" --n 6
 *
 *   # 2. take one: downloads + records attribution
 *   node fetch-photo.js --query "empty auditorium seats" --pick 3 --out images/urgency.jpg
 *
 *   # 3. or grab every candidate as a contact sheet for a storyboard
 *   node fetch-photo.js --query "empty auditorium seats" --n 6 --sheet images/cand/urgency
 *
 *   # 4. by id, once you know it
 *   node fetch-photo.js --id 5685019 --out images/close.jpg
 *
 *   --orientation landscape|portrait|square   (default landscape — slides are 16:9)
 *   --size  large2x|original|large            (default large2x ≈1880px, plenty for a
 *                                              1280 stage and a fraction of the bytes)
 *   --color <name|#rrggbb>                    steer toward the deck's palette
 *
 * Every download appends to <images>/credits.json — photographer, profile URL,
 * Pexels page, alt text. Attribution isn't required by the licence, but a credits
 * line in the appendix or the closing notes costs nothing and keeps it clean.
 *
 * LICENCE GUARDRAIL: never use a stock photo of a person to imply they endorse,
 * participate in, or testify for anything. No fake team photos, no fake
 * participants, no fake testimonials.
 *
 * Key: PEXELS_API_KEY env, else read from the .env file named by PEXELS_ENV_FILE
 */
const fs = require('fs'), path = require('path'), os = require('os');

const a = process.argv.slice(2);
const f = (n, d) => { const i = a.indexOf('--' + n); return i < 0 ? d : a[i + 1]; };
const query = f('query'), id = f('id'), out = f('out'), sheet = f('sheet');
if (!query && !id) { console.error(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(2); }

let key = process.env.PEXELS_API_KEY;
if (!key) {
  const envFile = (process.env.PEXELS_ENV_FILE || '').replace(/^~(?=\/)/, os.homedir());
  if (!envFile) { console.error('no PEXELS_API_KEY in env; set PEXELS_API_KEY, or PEXELS_ENV_FILE=<path to a .env with PEXELS_API_KEY=…>'); process.exit(2); }
  try { key = /PEXELS_API_KEY=(.+)/.exec(fs.readFileSync(envFile, 'utf8'))[1].trim(); }
  catch { console.error('no PEXELS_API_KEY in env and none readable at ' + envFile); process.exit(2); }
}
const H = { Authorization: key };
const SIZE = f('size', 'large2x');

const credit = (dest, p) => {
  const dir = path.dirname(path.resolve(dest));
  const file = path.join(dir, 'credits.json');
  let all = {};
  try { all = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  all[path.basename(dest)] = { id: p.id, photographer: p.photographer,
    photographer_url: p.photographer_url, pexels_url: p.url, alt: p.alt, source: 'pexels' };
  fs.writeFileSync(file, JSON.stringify(all, null, 2));
};

async function download(p, dest) {
  fs.mkdirSync(path.dirname(path.resolve(dest)), { recursive: true });
  const url = p.src[SIZE] || p.src.large2x || p.src.original;
  const r = await fetch(url);
  if (!r.ok) { console.error(`download failed ${r.status} for ${url}`); process.exit(1); }
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
  credit(dest, p);
  const kb = Math.round(fs.statSync(dest).size / 1024);
  console.log(`${dest}  ${p.width}x${p.height} (${SIZE}, ${kb}KB)  © ${p.photographer}`);
}

(async () => {
  if (id) {
    const r = await fetch('https://api.pexels.com/v1/photos/' + id, { headers: H });
    if (!r.ok) { console.error(`pexels ${r.status}`); process.exit(1); }
    const p = await r.json();
    if (!out) { console.log(JSON.stringify({ id: p.id, w: p.width, h: p.height, alt: p.alt,
      photographer: p.photographer, src: p.src[SIZE] }, null, 1)); return; }
    return download(p, out);
  }

  const n = +f('n', 6);
  const q = new URLSearchParams({ query, per_page: String(Math.min(80, n)),
    orientation: f('orientation', 'landscape') });
  if (f('color')) q.set('color', f('color'));
  const r = await fetch('https://api.pexels.com/v1/search?' + q, { headers: H });
  if (!r.ok) { console.error(`pexels ${r.status}: ${(await r.text()).slice(0, 200)}`); process.exit(1); }
  const { photos = [], total_results = 0 } = await r.json();
  if (!photos.length) { console.error(`no results for "${query}"`); process.exit(1); }

  const pick = f('pick');
  if (pick) return download(photos[+pick - 1], out || `images/${photos[+pick - 1].id}.jpg`);

  if (sheet) {                      // every candidate, numbered — for a storyboard
    for (let i = 0; i < photos.length; i++)
      await download(photos[i], `${sheet}-${i + 1}.jpg`);
    console.log(`\n${photos.length} candidates → ${sheet}-N.jpg  (pick with --pick N, or point the storyboard's art.candidates at these)`);
    return;
  }

  console.log(`"${query}" — ${total_results} results, showing ${photos.length}:\n`);
  photos.forEach((p, i) => {
    console.log(`${String(i + 1).padStart(2)}. ${p.width}x${p.height}  ${p.avg_color}  © ${p.photographer}`);
    console.log(`    ${(p.alt || '(no alt text)').slice(0, 96)}`);
    console.log(`    ${p.url}`);
  });
  console.log(`\nLOOK at them before choosing (open the urls, or --sheet to download the set).`);
  console.log(`Then: --pick N --out images/<name>.jpg`);
})();
