#!/usr/bin/env node
/**
 * Make a deck TRULY one file — inline every local image as a data: URI.
 *
 *   node bundle.js deck.html [--out deck-portable.html]
 *
 * The engine has no CDN, no npm and no external CSS/JS, so a built deck is almost
 * self-contained — except <img src="images/…">. That folder is why emailing just
 * the .html arrives with every picture broken. This produces a single file that
 * opens from an email attachment, a USB stick, or a stranger's laptop with no wifi.
 *
 * Base64 costs ~33% over the raw bytes, so bundle the JPEG (images-web) build, not
 * the full-resolution PNG one — on a 27-image deck that is ~6 MB instead of ~70 MB.
 *
 * Everything survives: animations, transitions, shaders, speaker notes, the
 * presenter window, theme switching, comment and edit mode. A PDF keeps none of
 * those. Leaves the input untouched.
 */
const fs = require('fs'), path = require('path');

const a = process.argv.slice(2);
const src = a.find(x => !x.startsWith('--'));
const outArg = (i => i < 0 ? null : a[i + 1])(a.indexOf('--out'));
if (!src) { console.error(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(2); }

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
               '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

const abs = path.resolve(src), dir = path.dirname(abs);
let html = fs.readFileSync(abs, 'utf8');
const before = Buffer.byteLength(html);
const out = outArg
  ? path.resolve(outArg)
  : path.join(dir, path.basename(src).replace(/\.html?$/i, '') + '-portable.html');

let done = 0, skipped = 0, missing = [];
const seen = new Map();   // same image used twice is embedded once

html = html.replace(/(<img\b[^>]*?\bsrc=")([^"]+)(")/gi, (m, pre, url, post) => {
  if (/^(data:|https?:|\/\/)/i.test(url)) { skipped++; return m; }
  const file = path.resolve(dir, decodeURIComponent(url));
  if (seen.has(file)) { done++; return pre + seen.get(file) + post; }
  if (!fs.existsSync(file)) { missing.push(url); return m; }
  const ext = path.extname(file).toLowerCase();
  const mime = MIME[ext];
  if (!mime) { skipped++; return m; }
  const uri = 'data:' + mime + ';base64,' + fs.readFileSync(file).toString('base64');
  seen.set(file, uri); done++;
  return pre + uri + post;
});

fs.writeFileSync(out, html);
const after = Buffer.byteLength(html);
const mb = n => (n / 1e6).toFixed(1) + ' MB';
console.log(`${path.relative(process.cwd(), out)} — ${done} image(s) inlined ` +
  `(${seen.size} unique), ${mb(before)} → ${mb(after)}`);
if (skipped) console.log(`  ${skipped} left as-is (remote or unsupported type)`);
if (missing.length) {
  console.log(`  WARNING — ${missing.length} image(s) NOT FOUND, still broken links:`);
  missing.forEach(u => console.log('    ' + u));
  process.exitCode = 1;
}
if (after > 22e6) console.log('  NOTE: over ~22 MB — past most email limits. Bundle the images-web build.');
