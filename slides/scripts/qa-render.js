#!/usr/bin/env node
/**
 * Visual QA pass for a deck built with deck-engine.html.
 *
 *   node qa-render.js <deck.html> [--out qa] [--theme dark] [--only 3,7]
 *
 * For every slide it:
 *   1. screenshots the 1280x720 stage  ->  <out>/slide-01.png
 *   2. measures the DOM for real defects (overflow, clipping, dead charts,
 *      broken images, empty slides, unreplaced placeholders)
 * Writes <out>/report.json and prints a table. Exit code 1 if any FAIL.
 *
 * The machine finds geometry bugs. You still have to LOOK at the PNGs for
 * taste, rhythm and copy — the script cannot see ugly.
 */
const path = require('path');
const fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { console.error('playwright not resolvable from here. Run the script from a folder under\n' +
  'a tree that has playwright installed (e.g. ~/node_modules), or `npm i -D playwright`.\n' +
  'If the browser binary is missing instead: npx playwright install chromium'); process.exit(2); }

const args = process.argv.slice(2);
const deck = args.find(a => !a.startsWith('--'));
const flag = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : args[i + 1]; };
if (!deck) { console.error('usage: node qa-render.js <deck.html> [--out qa] [--theme dark] [--only 3,7]'); process.exit(2); }

const outDir = path.resolve(flag('out', path.join(path.dirname(deck), 'qa')));
const only = flag('only') ? flag('only').split(',').map(Number) : null;
const theme = flag('theme');

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  // scale 1 on purpose: 1280px is already the max width an image-reading model
  // keeps, so 2x doubles the token cost of every screenshot for nothing.
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push(String(e)));
  page.on('console', m => m.type() === 'error' && consoleErrors.push(m.text()));

  await page.goto('file://' + path.resolve(deck));
  if (theme) await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
  // kill the scale transform so the stage screenshots 1:1
  await page.evaluate(() => {
    document.getElementById('stage').style.transform = 'none';
    document.getElementById('viewport').style.placeItems = 'start';
  });

  const count = await page.evaluate(() => document.querySelectorAll('.slide').length);
  const findings = [];

  for (let i = 0; i < count; i++) {
    if (only && !only.includes(i + 1)) continue;
    await page.evaluate(n => window.show(n, false), i);
    await page.waitForTimeout(1200); // let reveals + count-ups + bar grow finish
    const n2 = String(i + 1).padStart(2, '0');
    await page.locator('#stage').screenshot({ path: path.join(outDir, `slide-${n2}.png`) });

    const issues = await page.evaluate(() => {
      const out = [];
      const s = document.querySelector('.slide.is-active');
      const stage = document.getElementById('stage').getBoundingClientRect();
      const name = (el) => el.tagName.toLowerCase() +
        (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
      const txt = (el) => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48);

      // 1. anything painted outside the 1280x720 stage
      for (const el of s.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        if (getComputedStyle(el).position === 'fixed') continue;
        const over = [];
        if (r.right > stage.right + 1) over.push(`right +${Math.round(r.right - stage.right)}px`);
        if (r.bottom > stage.bottom + 1) over.push(`bottom +${Math.round(r.bottom - stage.bottom)}px`);
        if (r.left < stage.left - 1) over.push(`left ${Math.round(r.left - stage.left)}px`);
        if (r.top < stage.top - 1) over.push(`top ${Math.round(r.top - stage.top)}px`);
        // decorative bleed/orb elements are meant to run off the edge
        if (over.length && !el.closest('.bleed') && !el.classList.contains('orb'))
          out.push({ level: 'FAIL', kind: 'offstage', el: name(el), detail: over.join(', '), text: txt(el) });
      }
      // 1b. the slide itself must fill the stage — an fx or a stray style that
      //     breaks .slide's positioning silently shrinks every background on it
      const sr = s.getBoundingClientRect();
      if (Math.abs(sr.height - stage.height) > 2 || Math.abs(sr.width - stage.width) > 2)
        out.push({ level: 'FAIL', kind: 'slide-not-full', el: 'slide',
          detail: `slide is ${Math.round(sr.width)}x${Math.round(sr.height)}, stage is ${Math.round(stage.width)}x${Math.round(stage.height)}`, text: '' });
      // 2. clipped content (overflow hidden eating text)
      for (const el of s.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.overflow === 'visible') continue;
        // .bleed and .imgframe crop on purpose (object-fit:cover), and sub-pixel
        // rounding makes the image a pixel or two bigger than its box every time.
        if (el.closest('.bleed, .imgframe')) continue;
        if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)
          out.push({ level: 'FAIL', kind: 'clipped', el: name(el),
            detail: `content ${el.scrollWidth}x${el.scrollHeight} > box ${el.clientWidth}x${el.clientHeight}`,
            text: txt(el) });
      }
      // 3. charts that rendered nothing
      for (const c of s.querySelectorAll('.chart[data-chart]')) {
        const marks = c.querySelectorAll('.mark').length;
        if (!marks) out.push({ level: 'FAIL', kind: 'dead-chart', el: 'chart', detail: 'no marks drawn', text: '' });
      }
      // 4. broken / missing images
      for (const img of s.querySelectorAll('img')) {
        if (!img.getAttribute('src')) out.push({ level: 'WARN', kind: 'empty-img', el: 'img', detail: 'src=""', text: '' });
        else if (img.complete && img.naturalWidth === 0)
          out.push({ level: 'FAIL', kind: 'broken-img', el: 'img', detail: img.getAttribute('src'), text: '' });
      }
      // 5. placeholder copy left in — speaker notes are not on-slide text
      const body = [...s.children].filter(el => !el.classList.contains('notes'))
        .map(el => el.textContent || '').join(' ');
      for (const p of ['DECK TITLE', 'Lorem', 'TODO', 'goes here', 'in one line', 'XX'])
        if (body.includes(p)) out.push({ level: 'FAIL', kind: 'placeholder', el: 'slide', detail: p, text: '' });
      // 5b. AI tells the humanizer pass (SKILL.md step 5c) should have removed.
      // Prose only: .mark glyphs are UI, and notes count because the presenter says them aloud.
      const prose = [...s.children].map(el => el.textContent || '').join(' ')
        .replace(/[\u2013\u2014]\s*(?=$|[A-Z])/g, ' ');
      const proseNoGlyph = [...s.querySelectorAll('*')].filter(el => el.classList.contains('mark'))
        .reduce((t, el) => t.split(el.textContent).join(' '), prose);
      if (/[\u2014]/.test(proseNoGlyph))
        out.push({ level: 'WARN', kind: 'em-dash', el: 'slide', detail: 'em dash in prose — humanizer §8', text: '' });
      if (/\bnot (just|only|merely)\b|\bit'?s not [a-z]+, it'?s\b/i.test(proseNoGlyph))
        out.push({ level: 'WARN', kind: 'not-x-but-y', el: 'slide', detail: 'not-X-but-Y — humanizer §1', text: '' });
      // 6. empty or near-empty slide
      if (body.replace(/\s/g, '').length < 12)
        out.push({ level: 'WARN', kind: 'thin-slide', el: 'slide', detail: 'almost no text', text: '' });
      // 7. wall of text
      const words = body.split(/\s+/).filter(Boolean).length;
      if (words > 120) out.push({ level: 'WARN', kind: 'too-wordy', el: 'slide', detail: words + ' words', text: '' });
      // 8. tiny text (below 14px on the stage reads as unreadable projected)
      for (const el of s.querySelectorAll('*')) {
        if (el.closest('.notes')) continue;
        if (!el.children.length && (el.textContent || '').trim()) {
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs && fs < 13) out.push({ level: 'WARN', kind: 'tiny-text', el: name(el), detail: fs + 'px', text: txt(el) });
        }
      }
      return out;
    });

    const meta = await page.evaluate(() => {
      const s = document.querySelector('.slide.is-active');
      const has = (sel) => !!s.querySelector(sel);
      const fmt = s.classList.contains('section-slide') ? 'section'
        : s.classList.contains('cover') ? 'cover'
        : has('.chart') ? 'chart' : has('.stats') ? 'stat-grid' : has('.steps') ? 'steps'
        : has('.timeline') ? 'timeline' : has('.grid4') ? 'grid4' : has('.vs') ? 'compare'
        : has('table') ? 'table' : has('pre') ? 'code' : has('blockquote') ? 'quote'
        : has('.cols') ? 'two-column' : has('.bullets') ? 'bullets' : 'statement';
      return { title: s.dataset.title || '', fmt, notes: !!s.querySelector('.notes') };
    });
    findings.push({ slide: i + 1, ...meta, issues });
  }

  // rhythm: the rules in references/styles.md, checked instead of hoped for
  for (let i = 1; i < findings.length; i++)
    if (findings[i].fmt === findings[i - 1].fmt && findings[i].fmt !== 'chart')
      findings[i].issues.push({ level: 'WARN', kind: 'same-format-twice', el: 'slide',
        detail: `${findings[i].fmt} repeats slide ${findings[i - 1].slide}`, text: '' });
  let since = 0;
  for (const f of findings) {
    if (f.fmt === 'section' || f.fmt === 'statement' || f.fmt === 'cover') since = 0;
    else if (++since > 6) { f.issues.push({ level: 'WARN', kind: 'no-breather', el: 'slide',
      detail: `${since} content slides since the last section/statement`, text: '' }); since = 0; }
  }
  const noNotes = findings.filter(f => !f.notes).length;
  if (noNotes) console.log(`note: ${noNotes}/${findings.length} slides have no speaker notes ` +
    `(<aside class="notes">) — the deck can't be handed to anyone else to present`);

  await browser.close();

  const flat = findings.flatMap(f => f.issues.map(i => ({ slide: f.slide, ...i })));
  const fails = flat.filter(f => f.level === 'FAIL');
  fs.writeFileSync(path.join(outDir, 'report.json'),
    JSON.stringify({ deck, slides: findings.length, consoleErrors, findings }, null, 2));

  console.log(`\n${findings.length} slides rendered -> ${outDir}`);
  if (consoleErrors.length) console.log('JS ERRORS:', consoleErrors.slice(0, 5));
  if (!flat.length) console.log('No machine-detectable issues. Now LOOK at the PNGs.');
  else console.table(flat.map(f => ({ slide: f.slide, level: f.level, kind: f.kind, el: f.el, detail: f.detail, text: f.text })));
  console.log(`${fails.length} FAIL / ${flat.length - fails.length} WARN`);
  process.exit(fails.length ? 1 : 0);
})();
