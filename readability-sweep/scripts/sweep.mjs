#!/usr/bin/env node
// Readability sweep. For every visible text run on every configured page,
// theme and viewport: hide all text, screenshot what is actually behind it,
// and measure the text colour against those pixels. Photos, gradients,
// translucent bars and scrims all count, because it is the real render.
// Also records overlap (something else painted on top) and horizontal clipping.
//
//   node sweep.mjs <config.json>          (see config.example.json)
//
// Writes <out>/findings.json and a screenshot of every state that had a finding.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';

const cfgPath = process.argv[2];
if (!cfgPath) { console.error('usage: node sweep.mjs <config.json>'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const OUT = path.resolve(path.dirname(cfgPath), cfg.out || 'readability-sweep');
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;

// playwright-core: from the project, else from the home folder.
let chromium;
for (const base of [process.cwd(), os.homedir()]) {
  try { ({ chromium } = createRequire(path.join(base, 'package.json'))('playwright-core')); break; } catch {}
}
if (!chromium) { console.error('playwright-core not found. Run: npm i -D playwright-core'); process.exit(1); }
const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = cfg.chrome || (fs.existsSync(MAC_CHROME) ? MAC_CHROME : undefined);

const THEMES = cfg.themes || [{ name: 'light', colorScheme: 'light' }, { name: 'dark', colorScheme: 'dark' }];
const VIEWPORTS = cfg.viewports || [{ name: 'desk', width: 1440, height: 900 }, { name: 'phone', width: 390, height: 844 }];
const REMOVE = cfg.removeSelectors || ['nextjs-portal'];

const HIDE_TEXT = `*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important;text-decoration-color:transparent!important}
input::placeholder,textarea::placeholder{color:transparent!important;-webkit-text-fill-color:transparent!important}
svg{visibility:hidden!important}`;

// ---- in page: every visible text run in the viewport ----------------------
function collect() {
  const out = [], vw = innerWidth, vh = innerHeight, seen = new Set();
  const key = (el) => { const p = []; for (let e = el, i = 0; e && e !== document.body && i < 6; i++, e = e.parentElement) p.unshift(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '')); return p.join('>'); };
  const effOpacity = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity || '1'); return o; };
  const filtered = (el) => { for (let e = el; e; e = e.parentElement) if (getComputedStyle(e).filter !== 'none') return true; return false; };
  const srOnly = (el) => { for (let e = el, i = 0; e && i < 4; i++, e = e.parentElement) { const s = getComputedStyle(e), r = e.getBoundingClientRect(); if ((s.clip && s.clip !== 'auto') || s.clipPath === 'inset(50%)' || (r.width <= 2 && r.height <= 2)) return true; } return false; };
  // What is painted on top at a point, ignoring pointer-events tricks and
  // near-invisible layers (grain, glows). Text whose top layer is some other
  // fixed/sticky box (sticky header, floating button, modal backdrop) is
  // chrome overlap, not a colour problem; anything else on top is "covered".
  const pe = document.createElement('style'); pe.textContent = '*{pointer-events:auto!important}'; document.head.appendChild(pe);
  const inFixed = (e) => { for (; e && e !== document.body; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') return e; } return null; };
  // Only something that actually paints at the point counts: a fill, a
  // background image, media, a form control, or its own text under the point.
  // Transparent wrappers (full-screen layers, positioned containers) do not.
  const REPLACED = /^(IMG|VIDEO|CANVAS|SVG|PICTURE|INPUT|TEXTAREA|SELECT|BUTTON|IFRAME)$/;
  const paints = (e, x, y) => {
    const s = getComputedStyle(e);
    if (s.visibility === 'hidden' || effOpacity(e) < 0.2) return false; // faded-out layers do not cover
    if (REPLACED.test(e.tagName.toUpperCase())) return true;
    if (s.backgroundImage !== 'none') return true;
    const bg = s.backgroundColor.match(/[\d.]+/g);
    if (bg && (bg.length < 4 || parseFloat(bg[3]) > 0.05) && !/^rgba?\(0, 0, 0, 0\)$/.test(s.backgroundColor) && s.backgroundColor !== 'transparent') return true;
    for (const c of e.childNodes) if (c.nodeType === 3 && c.textContent.trim()) {
      const r = document.createRange(); r.selectNodeContents(c);
      if ([...r.getClientRects()].some((q) => x >= q.left && x <= q.right && y >= q.top && y <= q.bottom)) return true;
    }
    return false;
  };
  const topAt = (x, y) => document.elementsFromPoint(x, y).find((e) => paints(e, x, y));
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const txt = n.textContent.replace(/\s+/g, ' ').trim();
    if (txt.length < 2) continue;
    const el = n.parentElement;
    if (!el || seen.has(el) || el.closest('script,style,noscript,template')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const op = effOpacity(el);
    if (op < 0.06) continue;
    const range = document.createRange(); range.selectNodeContents(n);
    const rects = [...range.getClientRects()].filter((q) => q.width > 2 && q.height > 4 && q.bottom > 0 && q.top < vh && q.right > 0 && q.left < vw);
    if (!rects.length) continue;
    seen.add(el);
    const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight) || 400;
    // The same 5x3 grid per line that score() samples. Points under some
    // other fixed/sticky box are dropped from scoring; a point under anything
    // else painted on top marks the text as covered.
    let covered = null, total = 0, hidden = 0;
    const kept = rects.slice(0, 4).map((q) => {
      const mask = [];
      for (let i = 1; i <= 5; i++) for (let j = 1; j <= 3; j++) {
        const x = Math.min(vw - 1, Math.max(0, q.left + (q.width * i) / 6)), y = Math.min(vh - 1, Math.max(0, q.top + (q.height * j) / 4));
        const t = topAt(x, y); total++;
        let ok = true;
        if (t && t !== el && !el.contains(t) && !t.contains(el)) {
          const fx = inFixed(t);
          if (fx && !fx.contains(el)) { ok = false; hidden++; }
          else if (i === 3 && j === 2) covered = t.tagName.toLowerCase() + '.' + String(t.className).slice(0, 40) + ' pos=' + getComputedStyle(t).position;
        }
        mask.push(ok);
      }
      return mask;
    });
    const underChrome = hidden === total;
    let clipped = false;
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const s = getComputedStyle(e);
      if ((s.overflowX === 'hidden' || s.overflowX === 'clip') && e.scrollWidth > e.clientWidth + 2 && s.textOverflow !== 'ellipsis' && s.webkitLineClamp === 'none' && e.clientWidth > 0 && e.clientWidth < vw - 2) {
        const er = e.getBoundingClientRect();
        if (rects.some((q) => q.right > er.right + 2 || q.left < er.left - 2)) { clipped = true; break; }
      }
    }
    out.push({ key: key(el), text: txt.slice(0, 80), color: cs.color, opacity: op, size, weight,
      large: size >= 24 || (size >= 18.66 && weight >= 700),
      disabled: !!el.closest(':disabled,[aria-disabled="true"]'),
      srOnly: srOnly(el), filtered: filtered(el), underChrome,
      rects: rects.slice(0, 4).map((q) => [q.left, q.top, q.width, q.height]), masks: kept, covered, clipped });
  }
  document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach((el) => {
    if (el.value) return;
    const rr = el.getBoundingClientRect(); if (rr.bottom < 0 || rr.top > vh || !rr.width) return;
    const op = effOpacity(el); if (op < 0.06) return;
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
    out.push({ key: key(el) + '::placeholder', text: '[placeholder] ' + el.placeholder.slice(0, 70), color: getComputedStyle(el, '::placeholder').color,
      opacity: op, size: fs, weight: 400, large: false, disabled: el.disabled, srOnly: false, filtered: filtered(el), underChrome: false,
      rects: [[rr.left + parseFloat(cs.paddingLeft), rr.top + rr.height / 2 - fs * 0.6, Math.min(rr.width * 0.6, el.placeholder.length * fs * 0.45), fs * 1.2]], covered: null, clipped: false });
  });
  pe.remove();
  return out;
}

// ---- in page: score runs against the text-free screenshot ----------------
async function score(items, b64) {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
  const sx = img.width / innerWidth;
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = (r, gg, b) => 0.2126 * lin(r) + 0.7152 * lin(gg) + 0.0722 * lin(b);
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const res = [];
  for (const it of items) {
    // Resolve any CSS colour (rgb, oklab, oklch, lab, color-mix, color()) through a canvas.
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = '#000'; probe.fillStyle = it.color; probe.fillRect(0, 0, 1, 1);
    const d0 = probe.getImageData(0, 0, 1, 1).data;
    if (d0[3] === 0) continue;
    const a = Math.min(1, (d0[3] / 255) * it.opacity);
    const ratios = [];
    it.rects.forEach(([x, y, w, h], ri) => { let k = 0; for (let i = 1; i <= 5; i++) for (let j = 1; j <= 3; j++) {
      if (it.masks && it.masks[ri] && !it.masks[ri][k++]) continue;
      const px = Math.round((x + (w * i) / 6) * sx), py = Math.round((y + (h * j) / 4) * sx);
      if (px < 0 || py < 0 || px >= c.width || py >= c.height) continue;
      const d = g.getImageData(px, py, 1, 1).data;
      const t = [0, 1, 2].map((k) => d0[k] * a + d[k] * (1 - a));
      const l1 = L(t[0], t[1], t[2]), l2 = L(d[0], d[1], d[2]);
      ratios.push((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
    } });
    if (!ratios.length) continue;
    ratios.sort((p, q) => p - q);
    res.push({ ...it, p10: +ratios[Math.floor(ratios.length * 0.1)].toFixed(2), med: +ratios[Math.floor(ratios.length / 2)].toFixed(2) });
  }
  return res;
}

let browser;
try { browser = await chromium.launch({ executablePath }); }
catch (e) {
  console.error(`Could not start Chrome (${executablePath || "playwright's bundled browser"}).\n` +
    'Set "chrome" in the config to a Chrome/Chromium binary, or run: npx playwright install chromium');
  process.exit(1);
}
const findings = [];
const coverage = []; // proof each page/theme/viewport was really measured
const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 80);

async function sweepPage(ctx, pg, theme, vp, auth) {
  const p = await ctx.newPage();
  const where = `${pg.path} | ${theme.name} | ${vp.name} | ${auth}`;
  try { await p.goto(cfg.base + pg.path, { waitUntil: 'networkidle', timeout: 90000 }); } catch { await p.waitForTimeout(3000); }
  await p.waitForTimeout(pg.settleMs ?? cfg.settleMs ?? 900);
  await p.evaluate((sel) => sel.forEach((s) => document.querySelectorAll(s).forEach((e) => e.remove())), REMOVE);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const probe = await p.evaluate(() => ({ htmlClass: document.documentElement.className.split(/\s+/).filter((c) => !/__|variable/.test(c)).join(' '), bodyBg: getComputedStyle(document.body).backgroundColor, scheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' }));
  let measured = 0;
  const states = [];
  if (pg.scrollStops) for (const t of pg.scrollStops) states.push({ name: 'at' + t, y: t * vp.height, wait: pg.scrollWaitMs ?? 1400 });
  else { states.push({ name: 'top', y: 0 }); for (let y = vp.height * 0.85; y < H - vp.height * 0.2 && y < (cfg.maxScroll ?? 9000); y += vp.height * 0.85) states.push({ name: 'y' + Math.round(y), y }); }
  for (const a of pg.actions || []) states.push({ name: 'act:' + a.name, act: a });
  for (const st of states) {
    try {
      if (st.act) {
        await p.keyboard.press('Escape').catch(() => {});
        await p.evaluate(() => scrollTo(0, 0));
        const loc = p.locator(st.act.click).first();
        if (!(await loc.count())) continue;
        await loc.click(); await p.waitForTimeout(st.act.waitMs ?? 700);
      } else { await p.evaluate((y) => scrollTo(0, y), st.y); await p.waitForTimeout(st.wait ?? 250); }
      const items = await p.evaluate(collect);
      measured += items.length;
      if (!items.length) continue;
      const normal = await p.screenshot({ type: 'png' });
      const tag = await p.addStyleTag({ content: HIDE_TEXT });
      await p.waitForTimeout(60);
      const bare = await p.screenshot({ type: 'png' });
      await tag.evaluate((el) => el.remove());
      const res = await p.evaluate(async ([its, b64, fn]) => (new Function('return ' + fn)())(its, b64), [items, bare.toString('base64'), score.toString()]);
      let hit = false;
      for (const r of res) {
        const need = r.large ? 3 : 4.5;
        if (r.p10 < need || r.covered || r.clipped) { findings.push({ where, state: st.name, need, ...r }); hit = true; }
      }
      if (hit) fs.writeFileSync(path.join(OUT, 'shots', slug(`${where}-${st.name}`) + '.png'), normal);
    } catch (e) { findings.push({ where, state: st.name, error: String(e).slice(0, 200) }); }
  }
  coverage.push({ where, page: pg.path, theme: theme.name, viewport: vp.name, auth, states: states.length, measured, ...probe });
  await p.close();
}

for (const vp of VIEWPORTS) for (const theme of THEMES) {
  if (theme.viewports && !theme.viewports.includes(vp.name)) continue;
  for (const auth of cfg.auth ? ['out', 'in'] : ['out']) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: theme.colorScheme || 'light', deviceScaleFactor: 1 });
    if (auth === 'in') {
      const value = cfg.auth.cookie.value ?? fs.readFileSync(path.resolve(path.dirname(cfgPath), cfg.auth.cookie.valueFile), 'utf8').trim();
      await ctx.addCookies([{ name: cfg.auth.cookie.name, value, url: cfg.base }]);
    }
    if (theme.localStorage) await ctx.addInitScript((kv) => { try { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); } catch {} }, theme.localStorage);
    for (const pg of cfg.pages) {
      if (auth === 'in' && !pg.signedIn) continue;
      if (ONLY && !ONLY.some((o) => pg.path.startsWith(o))) continue;
      if (pg.themes && !pg.themes.includes(theme.name)) continue;
      process.stdout.write(`${vp.name} ${theme.name} ${auth} ${pg.path}\n`);
      await sweepPage(ctx, pg, theme, vp, auth);
    }
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify(findings, null, 1));
fs.writeFileSync(path.join(OUT, 'coverage.json'), JSON.stringify(coverage, null, 1));
console.log(`findings: ${findings.length} -> ${path.join(OUT, 'findings.json')}`);
