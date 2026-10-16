#!/usr/bin/env node
/**
 * Optional slide art via fal.ai. Text-free background art and illustrations only.
 *
 *   node gen-art.js --prompt "…" --out images/cover.png [options]
 *
 *   --model  schnell | dev | pro | recraft     (default schnell)
 *   --style  "…"     appended to every prompt — keep it IDENTICAL across a deck,
 *                    that is what makes 8 images look like one set
 *   --size   WxH     default 1536x864 (16:9). Use 1536x1152 for a 4:3 card image
 *   --seed   N       reproducible; reuse a seed to iterate on one image
 *   --n      N       N variations -> out-1.png, out-2.png … (pick one, delete rest)
 *   --allow-text     disable the no-text guard (you almost never want this)
 *
 * THE RULE: the image model never renders words. Every prompt gets a no-text
 * guard, and all copy stays as real HTML on top of the art. Generated type is
 * misspelled, unbrandable, and cannot be edited later.
 *
 * Costs real money (your fal.ai account). Roughly, per image:
 *   schnell ~$0.003   dev ~$0.025   pro ~$0.04   recraft ~$0.04
 * Draft with schnell, final pass with pro or recraft. Confirm a batch before
 * running it.
 *
 * Key: FAL_KEY env, else read from the .env file named by FAL_ENV_FILE
 */
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');

const MODELS = {
  schnell: { id: 'fal-ai/flux/schnell', cost: 0.003 },   // drafts, ~1s
  dev:     { id: 'fal-ai/flux/dev',     cost: 0.025 },   // better photoreal
  pro:     { id: 'fal-ai/flux-pro/v1.1', cost: 0.04 },   // final photoreal / abstract
  recraft: { id: 'fal-ai/recraft-v3',   cost: 0.04 },    // flat editorial illustration, vector-ish
};
const NO_TEXT = 'no text, no words, no letters, no numbers, no typography, no labels, ' +
  'no watermark, no logo, no UI chrome';

const a = process.argv.slice(2);
const f = (n, d) => { const i = a.indexOf('--' + n); return i < 0 ? d : a[i + 1]; };
const has = n => a.includes('--' + n);
const prompt = f('prompt'), out = f('out');
if (!prompt || !out) { console.error(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(2); }

const m = MODELS[f('model', 'schnell')];
if (!m) { console.error('model must be one of: ' + Object.keys(MODELS).join(', ')); process.exit(2); }
const [w, h] = f('size', '1536x864').split('x').map(Number);
const n = +f('n', 1);

let key = process.env.FAL_KEY;
if (!key) {
  const envFile = (process.env.FAL_ENV_FILE || '').replace(/^~(?=\/)/, os.homedir());
  if (!envFile) { console.error('no FAL_KEY in env; set FAL_KEY, or FAL_ENV_FILE=<path to a .env with FAL_KEY=…>'); process.exit(2); }
  try { key = /FAL_KEY=(.+)/.exec(fs.readFileSync(envFile, 'utf8'))[1].trim(); }
  catch { console.error('no FAL_KEY in env and none readable at ' + envFile); process.exit(2); }
}

const full = [prompt, f('style', ''), has('allow-text') ? '' : NO_TEXT]
  .filter(Boolean).join('. ');

(async () => {
  const body = { prompt: full, num_images: 1 };
  if (m.id.includes('recraft')) { body.image_size = { width: w, height: h }; body.style = f('rstyle', 'digital_illustration'); }
  else { body.image_size = { width: w, height: h }; }
  if (f('seed')) body.seed = +f('seed');

  const outs = [];
  for (let i = 0; i < n; i++) {
    if (n > 1 && !f('seed')) delete body.seed;
    const r = await fetch('https://fal.run/' + m.id, {
      method: 'POST',
      headers: { Authorization: 'Key ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) { console.error(`fal ${r.status}: ${(await r.text()).slice(0, 300)}`); process.exit(1); }
    const j = await r.json();
    const img = j.images[0];
    let dest = n > 1 ? out.replace(/(\.\w+)$/, `-${i + 1}$1`) : out;
    fs.mkdirSync(path.dirname(path.resolve(dest)), { recursive: true });
    const buf = Buffer.from(await (await fetch(img.url)).arrayBuffer());
    // recraft's vector styles return real SVG — keep it as SVG (crisper and tiny),
    // never rename it to .png, which produces a file nothing can open.
    const isSvg = /svg/.test(img.content_type || '') || buf.slice(0, 200).toString().includes('<svg');
    if (isSvg) {
      dest = dest.replace(/\.\w+$/, '.svg');
      fs.writeFileSync(dest, buf);
    } else {
      const tmp = dest + '.dl';
      fs.writeFileSync(tmp, buf);
      const want = path.extname(dest).slice(1).toLowerCase();
      try {
        execFileSync('sips', ['-s', 'format', want === 'jpg' ? 'jpeg' : want, tmp, '--out', dest],
          { stdio: 'ignore' });
        if (!fs.statSync(dest).size) throw new Error('empty');
        fs.unlinkSync(tmp);
      } catch {                       // conversion failed — keep the original bytes
        dest = dest.replace(/\.\w+$/, path.extname(new URL(img.url).pathname) || '.jpg');
        fs.renameSync(tmp, dest);
      }
    }
    outs.push({ dest, seed: j.seed, size: isSvg ? 'svg' : `${img.width || w}x${img.height || h}` });
  }
  for (const o of outs) console.log(`${o.dest}  ${o.size}  seed=${o.seed}`);
  console.log(`${n} image(s), ${f('model', 'schnell')}, ~$${(m.cost * n).toFixed(3)}`);
})();
