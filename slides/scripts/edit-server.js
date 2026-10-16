#!/usr/bin/env node
/**
 * Save-back server for in-browser deck edits.
 *
 *   node edit-server.js <deck.html> [--port 4179]
 *
 * Serves the deck's folder and accepts POST /save from the deck's edit mode
 * (press `e`, type on the slide, ⌘S). On save it:
 *   1. backs the current deck up to .bak/<name>-<n>.html
 *   2. splices the edited slides back between the deck's SLIDES markers
 *   3. writes the same slides to slides.html, so the source that new-deck.py
 *      reads never drifts from what you actually edited
 *
 * The deck page works from file:// too — CORS is open on 127.0.0.1 so ⌘S reaches
 * this server either way. Local only; it writes files, so don't expose it.
 */
const http = require('http'), fs = require('fs'), path = require('path');

const args = process.argv.slice(2);
const deckArg = args.find(a => !a.startsWith('--'));
if (!deckArg) { console.error('usage: node edit-server.js <deck.html> [--port 4179]'); process.exit(2); }
const pi = args.indexOf('--port');
const port = pi > -1 ? +args[pi + 1] : 4179;
const deckPath = path.resolve(deckArg);
const dir = path.dirname(deckPath);
if (!fs.existsSync(deckPath)) { console.error('no such deck: ' + deckPath); process.exit(2); }

const TYPES = { '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };

function backup(file) {
  const bakDir = path.join(dir, '.bak');
  fs.mkdirSync(bakDir, { recursive: true });
  const base = path.basename(file, '.html');
  const n = fs.readdirSync(bakDir).filter(f => f.startsWith(base + '-')).length + 1;
  const dest = path.join(bakDir, `${base}-${String(n).padStart(3, '0')}.html`);
  fs.copyFileSync(file, dest);
  return path.relative(dir, dest);
}

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();

  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 8e6) req.destroy(); });
    req.on('end', () => {
      try {
        const { file, html } = JSON.parse(body);
        // only ever write the deck this server was started for
        // served at '/', the page has no filename — that still means this deck
        const target = file ? path.join(dir, path.basename(file)) : deckPath;
        if (path.resolve(target) !== deckPath) throw new Error('refusing to write ' + target);
        const bak = backup(deckPath);
        const cur = fs.readFileSync(deckPath, 'utf8');
        const out = cur.replace(/<!-- SLIDES:START -->[\s\S]*?<!-- SLIDES:END -->/,
          () => '<!-- SLIDES:START -->\n' + html + '\n<!-- SLIDES:END -->');
        if (out === cur) throw new Error('SLIDES markers not found in the deck');
        fs.writeFileSync(deckPath, out);
        const frag = path.join(dir, 'slides.html');
        fs.writeFileSync(frag, html.trim() + '\n');
        console.log(`saved · backup ${bak}`);
        res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({
          deck: path.basename(deckPath), fragment: 'slides.html', backup: bak }));
      } catch (e) {
        console.error('save failed:', e.message);
        res.writeHead(400).end(e.message);
      }
    });
    return;
  }

  // static
  const rel = decodeURIComponent((req.url === '/' ? '/' + path.basename(deckPath) : req.url).split('?')[0]);
  const file = path.join(dir, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory())
    return res.writeHead(404).end('not found');
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => {
  console.log(`editing ${path.basename(deckPath)} — http://127.0.0.1:${port}/`);
  console.log('press e in the deck to edit, ⌘S to save. ctrl-c to stop.');
});
