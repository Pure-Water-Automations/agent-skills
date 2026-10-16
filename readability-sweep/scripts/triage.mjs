#!/usr/bin/env node
// Triage a readability sweep: drop the known false alarms, group by element,
// and print what is left worst-first as a markdown table.
//
//   node triage.mjs <out>/findings.json [--all]
//
// --all also prints the noise buckets, so you can check nothing real hid there.
import fs from 'node:fs';

const file = process.argv[2];
const showAll = process.argv.includes('--all');
const f = JSON.parse(fs.readFileSync(file, 'utf8'));

// Each rule: [bucket, test]. First match wins; anything unmatched is real.
const NOISE = [
  ['error', (x) => x.error],
  ['screen-reader-only text', (x) => x.srOnly],
  ['disabled control (WCAG-exempt)', (x) => x.disabled],
  ['under fixed/sticky chrome or a modal backdrop', (x) => x.underChrome && !/::placeholder/.test(x.key)],
  ['CSS filter on an ancestor (measure by eye)', (x) => x.filtered],
];
const buckets = {}, real = [];
for (const x of f) {
  const hit = NOISE.find(([, t]) => t(x));
  if (hit) (buckets[hit[0]] = buckets[hit[0]] || []).push(x);
  else if ((x.p10 < x.need) || x.clipped || x.covered) real.push(x);
}

function table(rows) {
  const g = {};
  for (const x of rows) { const k = (x.text || '').slice(0, 60) + '|' + x.key; (g[k] = g[k] || []).push(x); }
  const worst = Object.values(g).map((v) => v.sort((a, b) => (a.p10 ?? 99) - (b.p10 ?? 99))[0]).sort((a, b) => (a.p10 ?? 99) - (b.p10 ?? 99));
  console.log('| contrast | needs | where (page · theme · viewport · auth) | state | issue | text |');
  console.log('|---|---|---|---|---|---|');
  for (const w of worst) {
    const issue = [w.p10 < w.need ? 'low contrast' : '', w.covered ? 'covered by ' + w.covered.slice(0, 40) : '', w.clipped ? 'clipped' : ''].filter(Boolean).join('; ');
    console.log(`| ${w.p10 ?? '-'}:1 | ${w.need ?? '-'}:1 | ${w.where} | ${w.state} | ${issue || w.error} | ${(w.text || '').replace(/\|/g, '/').slice(0, 60)} |`);
  }
  return worst.length;
}

console.log(`\n## Real candidates (look at each screenshot before fixing)\n`);
const n = table(real);
console.log(`\n${n} element(s). Screenshots of each flagged state are in the sweep's shots/ folder.`);
// A clean result only counts if every combination was really measured and
// every theme really changed the page.
const covFile = file.replace(/findings\.json$/, 'coverage.json');
if (fs.existsSync(covFile)) {
  const cov = JSON.parse(fs.readFileSync(covFile, 'utf8'));
  const empty = cov.filter((c) => !c.measured);
  const byPage = {};
  for (const c of cov) (byPage[`${c.page} | ${c.viewport} | ${c.auth}`] = byPage[`${c.page} | ${c.viewport} | ${c.auth}`] || []).push(c);
  const same = [];
  for (const [k, v] of Object.entries(byPage)) {
    const seenLook = {};
    for (const c of v) { const look = c.htmlClass + ' / ' + c.bodyBg; if (seenLook[look]) same.push(`${k}: "${seenLook[look]}" and "${c.theme}" look identical (${look})`); else seenLook[look] = c.theme; }
  }
  console.log(`\n## Coverage\n\n${cov.length} page/theme/viewport runs, ${cov.reduce((a, c) => a + c.measured, 0)} text runs measured.`);
  if (empty.length) console.log(`\nWARNING: nothing measured for: ${empty.map((c) => c.where).join('; ')}. Page blank, wrong URL, or content behind auth?`);
  if (same.length) console.log(`\nWARNING: a theme did not change the page, so its result proves nothing. Check its colorScheme / localStorage key:\n- ${same.join('\n- ')}`);
  if (!empty.length && !same.length) console.log('Every run measured text and every theme changed the page.');
}

for (const [b, rows] of Object.entries(buckets)) {
  console.log(`\n- ${b}: ${rows.length} finding(s)${showAll ? '' : ' (hidden; --all to list)'}`);
  if (showAll) table(rows);
}
