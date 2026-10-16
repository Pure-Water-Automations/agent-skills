# Styles — themes, type, formats

Everything here is already implemented in `assets/deck-engine.html`. This file is
the *decision guide*: which theme, which format, what the limits are.

## The three themes

Set on `<html data-theme="…">`. Viewer can cycle them live with `t`.

| Theme | Looks like | Use for |
|---|---|---|
| `default` | Warm off-white (#FBFAF7), near-black ink, blue accent + orange second, soft card shadows | Proposals, board decks, internal strategy. **Default choice.** |
| `dark` | Near-black navy (#0D1016), light ink, brighter blue, glow orbs | Product/technical talks, conference keynotes, screen-only |
| `light` | Pure white, thin rules, deep navy accent, almost no shadow | Print/PDF hand-outs, academic, anything projected in a bright room |

Only ever change tokens in the `:root`/`html[data-theme=…]` blocks. Never hardcode
a hex in a slide — use `var(--ink)`, `var(--accent)`, `var(--s1)`.

**A supplied brand outranks all three themes.** If the user gives brand colours,
fonts, a logo or an existing deck to match, override `--accent`, `--accent-2`,
`--ink`, `--bg` and `--font-sans` in the theme block and keep everything else —
the layout principles are the same, only the palette changes. Don't replace the
brand with the house look because the house look is prettier.

### Colour roles

`--bg --bg-2` surfaces · `--panel --panel-2` cards · `--ink --ink-2 --ink-3` text
(primary/secondary/muted) · `--rule` hairlines · `--accent --accent-2` brand accents ·
`--s1…--s5` chart series · `--tint` accent at ~8% for chips and soft cards.

Chart series are the validated categorical palette (blue, orange, aqua, yellow,
violet) in that fixed order. **Never reorder and never go past 3 series on a
slide** — the first three slots are the ones that stay distinguishable for
colour-blind viewers at all pairs. A 4th category becomes "Other", or split the
chart. Text never wears a series colour; a coloured mark next to it carries the
identity.

## Type scale (on the fixed 1280×720 stage)

| Token | px | For |
|---|---|---|
| `--fs-display` | 88 | Cover / statement headline (`.display`) |
| `--fs-h1` | 56 | Cover h1 |
| `--fs-h2` | 40 | Every content-slide title |
| `--fs-h3` | 26 | Card headings |
| `--fs-stat` | 76 | Big numbers (`.stat`) |
| `--fs-body` | 21 | Body copy |
| `--fs-small` | 16 | Sublines, captions |
| `--fs-eyebrow` | 14 | Uppercase kicker above the title |

Nothing on a slide may be under 14px — it dies on a projector. The QA script
flags anything below 13px.

## Word budgets (ceilings, not targets)

| Element | Max |
|---|---|
| Slide title | 8 words |
| Eyebrow | 6 words |
| Body paragraph | 34 words |
| Bullet line | 12 words (+ subline 14) |
| Stat kicker | 4 words |
| Quote | 26 words |
| Whole slide | ~90 words (script warns >120) |

## Before you pick a format: pick the visual idea

A format is a container. Reaching for one first is how decks end up as tidy boxes
of text — technically clean, instantly forgettable. For each slide ask **what is
the visual move**, then choose the container that carries it.

| Instead of | Do |
|---|---|
| A bullet list | A journey, ladder, path or pipeline |
| Three cards | One metaphor with three labelled parts |
| A process list | A flow or timeline |
| "Strategy pillars" | Architecture, columns, a root system |
| Problem then solution | A gap and the bridge across it |
| A growth plan | Seed-to-tree, or a climb |
| A metrics table | One giant number + micro-context |
| A vision statement | A cinematic divider with one sentence |

One idea per slide. Make the most important word, number or symbol *huge*. Let a
few slides be almost empty — whitespace used deliberately reads as confidence.

**Do not:**
- default to three cards unless the content really is a set of three equal things
- use a card or panel whose only job is to hold text
- add icons that carry no meaning
- keep a chart that shows no pattern — a number or a diagram will land harder
- shrink type to fit words in. Cut the words.

Repeat a small set of motifs (the same badge shape, the same accent, the same
divider) so 20 slides read as one system.

## Format cheat-sheet

Snippets: `assets/formats.html`.

| # | Format | Use when | Hard limits |
|---|---|---|---|
| 1 | `cover` | Slide 1 only | 1 headline, ≤3 meta items |
| 2 | `section` | Chapter break, 2–4 per deck | Title only |
| 3 | `statement` | One idea needs to land alone | ≤12 words |
| 4 | `two-column` | Text needs an image/diagram beside it | 1 image |
| 5 | `stat-grid` | Three numbers frame the argument | **exactly 3** |
| 6 | `bullets` | Parallel list of points | 4–6 items |
| 7 | `steps` | A sequence/process | **exactly 3** |
| 8 | `compare` | Two options, old vs new | 2 cards, 3–4 lines each |
| 9 | `table` | Precise figures matter | ≤5 rows, ≤4 cols |
| 10 | `timeline` | Dates/milestones/phases | 3–5 nodes |
| 11 | `chart` | A trend or split is the point | ≤3 series |
| 12 | `quote` | Human proof, testimony | 1 quote |
| 13 | `code` | Technical audience, real syntax | ≤14 lines |
| 14 | `closing` | The decision you want | ≤3 asks |
| 15 | `grid4` | Four things that aren't a sequence | **exactly 4** |

Which chart: **bar** = compare a handful of things · **stacked** = parts of a
whole across a few groups · **line** = change over ≥3 time points ·
**donut** = one split, ≤4 slices, and only when the split *is* the point.
Never a dual-axis chart; two measures of different scale = two charts.

## Layout gotchas (learned the hard way)

The slide is a flex column: head at the top, one growing content region, nothing else.

- A **bare block** — a `<table>`, a `<pre>`, a lone image — must sit in a
  `<div class="fill">` or it sticks to the top with dead space underneath.
- A **trailing footnote** belongs *inside* the centring wrapper (`.steps`,
  `.timeline`, `.fill`). Put it outside and flexbox strands it at the very bottom of
  the slide, disconnected from what it annotates. Charts are the exception: the
  caption goes directly after `.chart`.
- `.steps` and `.timeline` need their inner `.steps-row` / `.timeline-row` — that
  row is what the connector line and the dots are positioned against. Drop it and
  the line floats away from the badges.
- Decorative `.bleed` images and `.orb` blobs are *meant* to run off the edge; the
  QA script knows to ignore those two and only those two.

## Boldness — the `--fx` layer

Injected only above `calm`, so a calm deck carries none of this code.

| Level | Automatic | Available per slide |
|---|---|---|
| `calm` | staggered reveals | — |
| `editorial` | kinetic headlines, Ken Burns on imagery | `spot` |
| `keynote` | + slide transitions (`--trans zoom\|push\|dip`) | + `motes`, `pixels` |
| `max` | + film grain | + `ember`, `aurora`, `mesh` |

Per-slide: `<section class="slide" data-fx="ember">`. Add `data-fx-over` to blend
the canvas over the content instead of behind it (good on a solid section slide,
bad anywhere with body copy).

| Effect | What it is | Where it works |
|---|---|---|
| `ember` | Rising heat and smoke, WebGL | Dark cover or a hard-truth slide. Not on light. |
| `aurora` | Slow flowing bands of light | Section dividers, with `data-fx-over` |
| `mesh` | Drifting colour cloud | Statement slides; on light themes it reads as warm paper |
| `motes` | Drifting particles, 2D canvas, very cheap | Stat slides, closings |
| `pixels` | A grid of squares lit by a slow diagonal wave, 2D canvas, cheap | **The one animated background that is safe behind a big number** — built for a single giant figure on an otherwise empty slide. Low alpha by design (34% dark / 18% light) |
| `spot` | Static radial glow, pure CSS | Anywhere you want depth with zero motion |

### Headline treatments — `data-fx-text` on the h1/h2

| Value | What happens | Use it |
|---|---|---|
| `particles` | The headline assembles out of ~2,000 motes flying into place, then hands off to the real type so it stays crisp (and prints as text) | Once. On the cover or the single biggest line in the deck |
| `mask` | A slow gradient flows through the letterforms | A statement slide on a **quiet** background — over a shader it loses contrast |
| `elastic` | Each letter settles in with a rubber overshoot | A short line — three words, not a sentence |

They override the default word-by-word rise on that headline. One per deck, two at
the very most: a signature move repeated stops being a signature.

### Other pieces

- **`.card.glass`** — frosted panel (`backdrop-filter`) for cards sitting over art
  or a shader. On a plain background it just looks like a weaker card; don't.
- **Film grain** — automatic at `max`. Animated canvas at 24fps, not a static SVG
  (the SVG version quietly made a 4-slide PDF 14 MB).
- **`--trans dive`** — the incoming slide rushes forward from small while the
  outgoing one blows past the camera. Strong; right between chapters, exhausting
  every slide. **`--trans tear`** wipes the new slide in along an angled edge.

Ideas ported from a *WOW Effects Library* design canvas. Deliberately
**not** ported, because a presented deck has no scroll and nobody is moving the
mouse: scroll-driven 3D assembly, horizontal scroll snapping, magnetic cursor
fields, inverted cursor magnets, scratch-to-reveal, canvas grid ripples, variable
font stepping, skeleton shimmers. Two worth revisiting if a deck ever needs them:
**FLIP tile expansion** (click a stat card to fill the slide — a real Q&A tool) and
**SVG contour morphing** (one chart shape becoming another).

Rules that keep this from becoming a screensaver:

- **Hero slides only.** A shader behind a table is noise. Three effect slides in a
  20-slide deck is plenty; if every slide glows, none of them do.
- **Never behind body copy or a chart.** Contrast is the first casualty.
- Shaders fall back to a CSS glow where WebGL is unavailable, freeze to a single
  frame under `prefers-reduced-motion`, and are dropped entirely in print — so the
  PDF is always the clean version.
- Effects are theme-aware and auto-dim on light surfaces, but **look at the
  screenshot** — the QA script measures geometry, not whether your headline
  survived the fire.

### Art prompts follow boldness

Same subject, different brief:

- `calm` — usually no art at all, or one faint texture at 16%.
- `editorial` — real, quiet photography; one recurring subject across the deck.
- `keynote` — bold abstract compositions, strong directional light, deep negative
  space for the copy.
- `max` — dramatic and high-contrast: long shadows, volumetric light, single
  saturated accent against near-black, one motif recurring in every image. Still
  never "cinematic" (letterbox bars), still no text, still a reserved copy zone.

## Rhythm rules

- Never the same format twice in a row.
- A deck of *n* slides uses at least `min(6, n/2)` distinct formats.
- Break every 4–6 content slides with a `section` or `statement`.
- Charts and stat-grids are the loud slides: at most one every 3 slides.
- End on the ask, never on "Thank you".

## Animation

Add `data-anim` to each element that should fade up; order = document order,
70ms stagger, handled by the engine. `data-anim="pop"` for badges and stats,
`data-anim="grow"` for connector lines and rules. Bars grow themselves; stats
with `data-count` count up. Everything respects `prefers-reduced-motion`.

Don't animate more than ~8 elements on one slide, and never animate body text
word-by-word.

## Images

Put files in an `images/` folder next to the deck HTML and reference them
relatively. Never stretch an image by setting both width and height.

| Treatment | What it is | Use for |
|---|---|---|
| `.imgframe` | Rounded, bordered, cropped frame. Set `aspect-ratio`, let `object-fit:cover` crop. | A diagram or photo beside text |
| `.bleed` | Full-slide background at 16% opacity | Faint texture behind a cover |
| `.bleed.mask` | …plus a left-side gradient | Texture with copy over it |
| `.bleed.art` | Full-strength artwork + an angled scrim keeping the left ~45% readable | Real generated/photographic art on a cover or divider |
| `.bleed.right` | Artwork as a panel on the right 46% | Art with a hard edge, copy fully clear of it |
| `.bleed.bottom-fade` | Fades the lower third into the background | When chrome or a footnote sits over art |

Nudge the crop with an inline `object-position` on the `<img>` (e.g.
`style="object-position:82% 28%"`) when the subject collides with the headline.
The QA screenshot is where you catch that — the script can't see it.

### Stock photography — free, try this first

The `pexels` MCP returns real photographs at no cost. For a real
place, a real object, a real texture, a real crowd, it beats generated art — and
it's free, so it costs nothing to look before spending on fal.

```
photos_search  query:"empty auditorium seats"  orientation:"landscape"  per_page:"6"
```

**Every numeric argument is a string** (`per_page:"6"`) — integers fail validation.
Download `src.original` into `images/`, then treat it exactly like generated art
(`.bleed.art`, `.imgframe`, `object-position` to keep the subject off the headline).

Two rules: pick photos with **real empty space** for copy rather than cropping a
busy one, and **never imply a depicted person endorses anything** — no stock face
as a participant, testimonial or team member. Credit the photographer in the
appendix when it's easy.

### Generated art (optional, costs money)

`scripts/gen-art.js` → fal.ai. Entirely optional; a deck with no
imagery is not a worse deck.

```bash
node scripts/gen-art.js --prompt "…" --style "…" --out images/cover.png --model pro
```

- **The image model never renders words.** A no-text guard is appended to every
  prompt automatically. All copy stays real HTML on top — generated type is
  misspelled, off-brand and uneditable.
- **Draft with `schnell` (~$0.003), finish with `pro` (~$0.04).** `recraft` +
  `--rstyle vector_illustration` returns real SVG line art — good inside an
  `.imgframe`, bad as a background (it fills the whole frame).
- **Reserve the copy zone in the prompt** ("the LEFT HALF is empty sky with nothing
  in it") and then check the render. `pro` obeys it; `schnell` mostly doesn't.
- **Never write "cinematic"** — it bakes black letterbox bars into the image.
- Keep one `--style` string identical across the whole deck; that is what makes a
  set of images look like a set. `--seed` to iterate on one image, `--n 3` to pick.
- Confirm model and count with the user before generating a batch. It is their money.

## Fonts

System sans stack by default — zero network dependency, works offline and in
Preview. To use a web font, add one `<link>` in `<head>` and change `--font-sans`;
keep a system fallback in the stack so a broken CDN doesn't ruin the deck.
