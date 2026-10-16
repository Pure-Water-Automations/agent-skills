#!/usr/bin/env node
/**
 * Speaker-notes editor for a built deck (or its slides fragment).
 *
 *   node notes-review.js slides.html [--out notes-review.html]
 *
 * Notes are the talk; the slides are captions for it. Edit mode inside the deck
 * deliberately skips .notes (deck-engine.html bails on anything inside it), and
 * notes are display:none, so there is nothing to click. This emits a page where
 * every note is a textarea, tracks which ones you changed, and hands the changed
 * ones back as markdown to paste into chat.
 *
 * Read-only: it never touches the source deck. Apply the changes by pasting the
 * export to Claude, or by editing slides.html and re-running new-deck.py.
 */
const fs = require('fs'), path = require('path');

const a = process.argv.slice(2);
const src = a.find(x => !x.startsWith('--'));
const outArg = (i => i < 0 ? null : a[i + 1])(a.indexOf('--out'));
if (!src) { console.error(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(2); }

const html = fs.readFileSync(src, 'utf8');
const out = outArg || path.join(path.dirname(path.resolve(src)), 'notes-review.html');

const strip = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// <p>a</p><p>b</p> -> "a\n\nb"   (blank-line separated, the shape we read back)
const notesToText = inner => {
  const ps = [...inner.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(m => strip(m[1])).filter(Boolean);
  return (ps.length ? ps : [strip(inner)]).filter(Boolean).join('\n\n');
};

const slides = [];
for (const m of html.matchAll(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"[^>]*>([\s\S]*?)<\/section>/g)) {
  const body = m[1], open = m[0].slice(0, m[0].indexOf('>'));
  const title = (/data-title="([^"]*)"/.exec(open) || [, ''])[1];
  const head = (/<h[12][^>]*>([\s\S]*?)<\/h[12]>/.exec(body) || [, ''])[1];
  const aside = /<aside class="notes">([\s\S]*?)<\/aside>/.exec(body);
  slides.push({
    n: slides.length + 1,
    title: title || `Slide ${slides.length + 1}`,
    head: strip(head),
    note: aside ? notesToText(aside[1]) : '',
  });
}
if (!slides.length) { console.error('no <section class="slide"> found in ' + src); process.exit(1); }

const missing = slides.filter(s => !s.note).length;
const words = s => s.note ? s.note.trim().split(/\s+/).length : 0;

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Speaker notes — ${esc(path.basename(src))}</title>
<style>
*{box-sizing:border-box}
:root{--bg:#101318;--panel:#171C24;--panel-2:#1E2530;--ink:#EDF0F5;--ink-2:#9AA3B2;
  --ink-3:#5F6875;--rule:#262E3A;--accent:#3987E5;--warm:#D95926;--good:#199E70}
body{margin:0;background:var(--bg);color:var(--ink);padding:34px 40px 120px;
  font:15px/1.6 ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
header{max-width:1000px;margin:0 auto 24px}
h1{font-size:25px;margin:0 0 6px;letter-spacing:-.01em}
.sub{color:var(--ink-2);font-size:14px;max-width:80ch}
.meta{display:flex;gap:20px;flex-wrap:wrap;margin-top:12px;font-size:12.5px;color:var(--ink-3);
  font-family:ui-monospace,Menlo,monospace}
.meta b{color:var(--ink-2);font-weight:600}
#list{max-width:1000px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
.item{background:var(--panel);border:1px solid var(--rule);border-radius:12px;overflow:hidden;
  outline:2px solid transparent}
.item.dirty{outline-color:var(--warm)}
.item.empty{border-style:dashed}
summary{cursor:pointer;padding:13px 17px;display:flex;gap:12px;align-items:baseline;list-style:none}
summary::-webkit-details-marker{display:none}
summary::before{content:"▸";color:var(--ink-3);font-size:12px;transition:transform .15s}
details[open] summary::before{transform:rotate(90deg)}
.num{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:var(--ink-3)}
.ttl{font-weight:650;font-size:15.5px}
.hd{color:var(--ink-2);font-size:13.5px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wc{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:var(--ink-3);white-space:nowrap}
.wc.chg{color:var(--warm)}
.wrap{padding:0 17px 16px}
textarea{width:100%;min-height:150px;resize:vertical;font:inherit;font-size:14.5px;line-height:1.65;
  background:var(--bg);color:var(--ink);border:1px solid var(--rule);border-radius:9px;padding:13px 15px}
textarea:focus{outline:2px solid var(--accent);border-color:transparent}
.hint{font-size:12.5px;color:var(--ink-3);margin:9px 0 0;display:flex;gap:14px;flex-wrap:wrap}
.hint button{font:inherit;font-size:12.5px;background:none;border:0;color:var(--accent);cursor:pointer;padding:0}
.hint button:hover{text-decoration:underline}
#bar{position:fixed;left:0;right:0;bottom:0;display:flex;gap:14px;align-items:center;
  padding:14px 40px;background:rgba(12,15,20,.93);backdrop-filter:blur(10px);
  border-top:1px solid var(--rule);z-index:10}
#count{font-size:13.5px;color:var(--ink-2);font-variant-numeric:tabular-nums;flex:1}
#bar button{font:inherit;font-size:14px;font-weight:600;padding:10px 20px;border-radius:9px;
  border:0;background:var(--accent);color:#fff;cursor:pointer}
#bar button.ghost{background:var(--panel-2);color:var(--ink-2);font-weight:500}
#bar button:hover{filter:brightness(1.1)}
</style></head><body>
<header>
  <h1>Speaker notes — ${esc(path.basename(src))}</h1>
  <p class="sub">These are what you say out loud, not what the audience reads. Edit any of them,
  then <b>Copy changed notes</b> and paste to Claude — only the ones you touched are exported.
  Blank lines separate paragraphs. Nothing here writes to the deck.</p>
  <div class="meta"><span><b>slides</b> ${slides.length}</span>
    <span><b>words</b> ${slides.reduce((t, s) => t + words(s), 0)}</span>
    <span><b>missing notes</b> ${missing}</span></div>
</header>
<div id="list"></div>
<div id="bar">
  <span id="count"></span>
  <button class="ghost" id="expand">Expand all</button>
  <button class="ghost" id="reset">Discard my edits</button>
  <button id="copy">Copy changed notes</button>
</div>
<script>
const SLIDES = ${JSON.stringify(slides)};
const KEY = 'deck-notes-edit:' + ${JSON.stringify(path.basename(src))};
let E = JSON.parse(localStorage.getItem(KEY) || '{}');      // {n: editedText}
const save = () => localStorage.setItem(KEY, JSON.stringify(E));
const list = document.getElementById('list');
const wc = t => t.trim() ? t.trim().split(/\\s+/).length : 0;

for (const s of SLIDES) {
  const cur = E[s.n] !== undefined ? E[s.n] : s.note;
  const d = document.createElement('details');
  d.className = 'item' + (s.note ? '' : ' empty');
  d.innerHTML =
    '<summary><span class="num">' + String(s.n).padStart(2, '0') + '</span>' +
    '<span class="ttl"></span><span class="hd"></span><span class="wc"></span></summary>' +
    '<div class="wrap"><textarea spellcheck="true"></textarea>' +
    '<p class="hint"><span>Blank line = new paragraph.</span>' +
    '<button data-act="revert">revert this note</button></p></div>';
  d.querySelector('.ttl').textContent = s.title;
  d.querySelector('.hd').textContent = s.head ? '“' + s.head + '”' : '(no headline)';
  const ta = d.querySelector('textarea');
  ta.value = cur;
  const paint = () => {
    const dirty = ta.value !== s.note;
    d.classList.toggle('dirty', dirty);
    const w = d.querySelector('.wc');
    w.textContent = (s.note ? wc(ta.value) + ' words' : 'no note') + (dirty ? ' · edited' : '');
    w.className = 'wc' + (dirty ? ' chg' : '');
    count();
  };
  ta.oninput = () => { E[s.n] = ta.value; save(); paint(); };
  d.querySelector('[data-act=revert]').onclick = e => {
    e.preventDefault(); ta.value = s.note; delete E[s.n]; save(); paint();
  };
  list.append(d); paint();
}
function count() {
  const n = SLIDES.filter(s => (E[s.n] !== undefined ? E[s.n] : s.note) !== s.note).length;
  document.getElementById('count').textContent =
    n ? n + ' note' + (n > 1 ? 's' : '') + ' edited' : 'No edits yet';
}
count();
document.getElementById('expand').onclick = () => {
  const items = [...document.querySelectorAll('details')];
  const open = items.every(i => i.open);
  items.forEach(i => i.open = !open);
  document.getElementById('expand').textContent = open ? 'Expand all' : 'Collapse all';
};
document.getElementById('reset').onclick = () => {
  if (!confirm('Discard every edit on this page and restore the original notes?')) return;
  E = {}; save(); location.reload();
};
document.getElementById('copy').onclick = () => {
  const L = ['## Speaker-note edits — ' + document.title.replace('Speaker notes — ', ''), ''];
  for (const s of SLIDES) {
    const cur = E[s.n] !== undefined ? E[s.n] : s.note;
    if (cur === s.note) continue;
    L.push('### ' + s.n + ' · ' + s.title, '');
    L.push(cur.trim() ? cur.trim() : '_(delete this note)_', '');
  }
  if (L.length <= 2) L.push('_No notes edited._');
  const md = L.join('\\n');
  navigator.clipboard?.writeText(md).then(() => {
    const b = document.getElementById('copy');
    b.textContent = 'Copied — paste to Claude';
    setTimeout(() => b.textContent = 'Copy changed notes', 2200);
  }, () => prompt('Copy this:', md));
};
</script></body></html>`;

fs.writeFileSync(out, page);
console.log(`${out} — ${slides.length} slides, ${slides.reduce((t, s) => t + words(s), 0)} words of notes` +
  (missing ? `, ${missing} with NO note` : ''));
