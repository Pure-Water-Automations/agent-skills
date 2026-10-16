---
name: slides
description: >-
  Build a beautiful, animated, self-contained HTML slide deck from a rough
  outline, a topic, a document, or an existing PowerPoint — instead of dragging
  boxes around in PowerPoint or Google Slides. One HTML file, 15 slide formats,
  3 themes (default / dark / light), live interactive charts with hover
  tooltips, count-up stats, staggered reveal animations, keyboard navigation, a
  presenter view with speaker notes and a timer, and a machine-checked visual QA
  pass that screenshots every slide and fixes the layout bugs before the user ever
  sees it. Metaphor-first, not text arranged in boxes. A boldness dial from calm
  boardroom to max — kinetic headlines, zoom/push transitions, live WebGL
  ember/aurora/mesh shaders, particles. Imagery is a choice: free real photographs
  from Pexels, or generated art via fal.ai (paid — confirm that spend),
  or none. Use whenever the user says
  "/slides", "make a slide deck", "build a presentation", "turn this into
  slides", "make a deck about X", "redo this PowerPoint", "convert this pptx",
  "I need slides for the board/assembly/team", "deck for this proposal", or
  hands over an outline/doc/pptx and wants it presentable. Also use for
  investor/board/proposal decks and conference talks. NOT for a written
  tutorial script (tutorial-script), NOT for a narrated video
  (app-tutorial-video), NOT for a .pptx file as the required deliverable —
  though this skill exports PDF and can be told to keep a .pptx twin.
works-in: Claude
---

# Slides — outline in, animated HTML deck out

If a LOCAL.md file sits next to this SKILL.md, read it first — it holds this workspace's specifics (paths, tools, examples) and overrides the generic defaults below.

Decks are code. A slide deck is one HTML file with CSS animations and hand-rolled
SVG charts — no PowerPoint, no Google Slides, no CDN, no build step. The presenter opens
it in a browser, presents with arrow keys, and prints to PDF if someone needs a
file.

**Files in this skill**

| Path | What it is |
|---|---|
| `assets/deck-engine.html` | The whole engine — tokens, 3 themes, nav, animations, chart renderer, print CSS. Copy it, swap the slides. |
| `assets/formats.html` | Copy-paste markup for all 15 slide formats + 4 chart types. |
| `assets/effects.html` | The boldness layer — kinetic type, transitions, WebGL shaders, particles. Injected only above `--fx calm`. |
| `assets/storyboard.html` | The approval gate — wireframes + live FX thumbnails + schnell art drafts + verdict buttons. Fill the `BOARD` spec. |
| `references/styles.md` | Which theme, which format, type scale, word budgets, rhythm rules. **Read before generating.** |
| `scripts/new-deck.py` | Drops a slides fragment into the engine → one deck file. |
| `scripts/qa-render.js` | Screenshots every slide + finds overflow/clipping/dead charts. |
| `scripts/to-pdf.js` | Exports the deck to a landscape 16:9 PDF, one page per slide. |
| `scripts/pptx-text.py` | Dumps text + images out of an existing `.pptx` (stdlib only). |
| `scripts/fetch-photo.js` | **Free** stock photography via Pexels — search, pick, download, records attribution. |
| `scripts/gen-art.js` | **Paid** generated art via fal.ai (~$0.003 draft / ~$0.04 final). Confirm the spend — step 5b. |
| `scripts/edit-server.js` | Saves in-browser edits back to disk — see *Revising*. |
| `scripts/notes-review.js` | Speaker-notes editor for a built deck — every note as a textarea, exports only what changed. |
| `scripts/bundle.js` | Inlines every image as a data: URI → ONE portable file to email. The only way the "self-contained" promise survives being sent. |

## The steps

Do them in order. Step 5 is not optional — it is the step that makes the output
good, and it is the one that is tempting to skip.

### 1. Load the rules

Read `references/styles.md` and skim `assets/formats.html`. Don't invent layouts;
the format library exists so every slide is already balanced.

### 2. Ask the clarifying questions — once, batched

Use **AskUserQuestion** (house rule: decisions as multiple choice, all
at once, never drip-fed). Skip anything the prompt already answers; never ask
about something you can read out of an attached file.

- **Content** — is there content ready (doc / pptx / outline / URL), or just a topic?
- **Length** — tight (8–12) · standard (15–20) · full (25+)?
- **Theme** — `default` (warm proposal) · `dark` (technical/keynote) · `light` (print-friendly)?
- **Boldness** — how far to push it (this changes what gets built, so always ask):

| `--fx` | What it looks like | Right for |
|---|---|---|
| `calm` | Today's deck. Staggered reveals, nothing else. | Boards, budget approvals, anything where showmanship costs credibility |
| `editorial` | Kinetic headlines rise word by word, Ken Burns on imagery | Internal strategy, all-hands, a deck that has to feel alive but not loud |
| `keynote` | + zoom/push/dip slide transitions, ambient particles on hero slides | Conference talk, launch, a room you have to hold |
| `max` | + live WebGL shaders (ember / aurora / mesh), particle-assembled headlines, film grain, generated art per section | Vision decks, showcases, "make people sit up" |

- **Imagery** — where do pictures come from? Ask this whenever the deck plausibly
  wants any:

| Choice | What it means | Right when |
|---|---|---|
| `none` | Type, charts, colour, effects only | Numbers decks; anything where a photo would be decoration |
| `stock` | Real photographs from Pexels — **free** | The subject is a real place, object, texture, room, crowd |
| `generated` | fal.ai images (~$0.003 draft / ~$0.04 final each) | You need a specific composition, a reserved copy zone, an exact palette, or something that doesn't exist |
| `mixed` | Stock for content slides, generated for the hero moments | **Usually the honest answer on a max deck** |

- **Audience** — who is in the room, and what do they decide afterwards?

Boldness is not a quality setting. `max` on a finance review reads as a startup
pitch and undermines the numbers; `calm` on a vision keynote reads as a memo. Ask,
and say which one you'd pick and why.

If a source file is attached, ingest it *before* asking, so the questions can be
specific ("your pptx has 21 slides — keep all 21 or tighten to 15?").

### 3. Ingest + research

- **`.pptx`** → `python3 scripts/pptx-text.py deck.pptx --media images/`
  (stdlib only — `python-pptx` isn't needed.)
- **`.docx` / `.pdf`** → the `docx` / `pdf` skills, or `textutil`.
- **Notion / Drive / Gmail source** → a local mirror/export first if the workspace has one, else the matching MCP.
- **Web research** — offer it, then do it. A deck built only on the user's own
  notes is thinner than one with two or three checked outside facts. Ask before
  fetching; cite what you added so the user can strike it.
- Never invent a statistic. If a number is needed and unknown, mark it
  `[figure TK]` in the outline and ask.

### 3b. Brainstorm the direction — at `keynote` and `max`, always

Before the storyboard, propose **three genuinely different creative directions**
and let the user pick. Not three shades of the same deck — three arguments about how
this story should feel. Each one in five lines:

```
DIRECTION B · "The Bench"
  Through-line:  the movement isn't short of willing people, it's short of formed ones
  Visual system: dark ground, ember shader on the two hero slides, everything else
                 quiet — heat only where the argument gets hot
  Signature move: the count of formed leaders climbs on screen while the cost falls
  Art:           one recurring image — a path, shot four different ways
  Risk:          the fire reads as drama; wrong if the room wants sobriety
```

Give each a name, a through-line, a visual system, one signature move, and the
risk of choosing it. Then say which you'd pick. If the user picks a hybrid, that's
the usual outcome — take the through-line from one and the visual system from
another and say so explicitly before you build.

At `calm` and `editorial` this collapses to one line: state the through-line and
move on. Three directions for a five-slide budget update is theatre.

### 4. Storyboard first, and get verdicts

**Gate: at `keynote`/`max`, or whenever generated art is planned, build the VISUAL
storyboard** (below). At `calm`/`editorial` with no art, a text storyboard in chat
is enough — one block per slide:

```
n. FORMAT · headline (≤8 words)
   takeaway: what they should understand or feel
   visual:   the visual move (metaphor / diagram / giant number / image)
   on slide: the actual words, counted
   say:      the speaker note — what the presenter would actually say here
```

**Draft the `say:`/`note:` line before the on-slide words, not after.** The note is
the talk; the slide is a caption for it. Writing what you'd *say* is what tells you
what the slide has to *show* — and it regularly produces better on-slide copy than
starting from the slide (a note reading "a couch for the youth centre, renovating a
room" beats a slide reading "one material need"). It also puts the argument in front
of the user at the cheap stage, instead of them approving a shape and meeting the prose
for the first time in a finished deck.

The user can force either with "storyboard it" / "skip the storyboard".

**The visual storyboard** — copy `assets/storyboard.html` next to the future deck
as `storyboard-<slug>.html` and replace the `BOARD` spec between the
`SPEC:START`/`SPEC:END` markers. One card per slide, and the page renders:

- a **gray wireframe** of the layout (all 15 formats supported) — deliberately
  unpolished so feedback stays structural, but with the REAL headline and words,
  because word count is structure;
- **live FX thumbnails** — `fx:`/`fxText:` in the spec mounts the actual shader /
  particle headline / mask / elastic treatment small, click to replay;
- **art candidates** — for `stock`, drop 4–6 Pexels candidates per image slot into
  `art.candidates` (`fetch-photo.js --sheet` grabs the set); they render as a
  clickable strip and the user's pick comes back in the export, so the actual
  photograph is chosen before the deck exists. For `generated`, before building the
  board, generate each planned image at
  `schnell` (~$0.003 each; state the count, no confirmation needed at that tier)
  and point `art.src` at the draft. Full-bleed treatments paint the thumb;
  `.imgframe` art lands in the wireframe's image zone;
- **the thinking** — a one-line `why:` per slide, so the user can disagree with the
  reasoning, not just the pixels;
- **the speaker note** — `note:` per slide, collapsed behind a disclosure so 30
  cards stay scannable, expandable into an editable textarea, with a word count and
  a warm "none yet" on any card missing one. "Read all notes" in the footer opens
  every one. This is the script review, and it is the most valuable thing on the
  board — a note that won't come out of the presenter's mouth is cheapest to fix here.
  Keep `why:` and `note:` distinct: `why:` is you explaining a design choice *to
  the user*; `note:` is what *the presenter says to the room*;
- **verdict buttons** — ✓ keep / ✎ change+note / ✕ cut per card, a deck-level
  note, all persisted in localStorage, and a **Copy feedback** button that returns
  the verdicts to chat as markdown (unmarked = keep) **plus a `## Speaker-note
  edits` section carrying any note the user rewrote**. Those edits are authoritative —
  build the deck's `<aside class="notes">` from them verbatim, don't re-draft.

Open it (`open storyboard-<slug>.html`), tell the user to mark it up and paste the
export back. **Do not build the deck until the verdicts come back.** Apply them:
CHANGE notes are instructions, CUT slides go (mind the rhythm rules after
removal), structural rework at deck level means a second storyboard pass —
still minutes. Art that survives gets regenerated at `pro` for the build
(~$0.04/image — this spend still gets confirmed).

Either way, check the plan against `styles.md`: is each slide a *visual move* or
just tidy text? No format twice in a row, a breather every 4–6 slides, ends on
the ask.

### 5. Generate the deck

- Write the slides alone into `slides.html` in the working folder (a project folder
  if there is one, else `~/Desktop/decks/<slug>/`) — just the `<section
  class="slide">` blocks, nothing else. Then assemble:

  ```bash
  python3 scripts/new-deck.py slides.html <slug>.html \
      --title "Real Title — Subtitle" --theme default --fx calm
  ```

  `--fx` is the boldness answer from step 2 (`calm|editorial|keynote|max`); the
  effects layer is only injected when it's above `calm`, so a calm deck stays
  lean. `--trans zoom|push|dip` picks the transition at `keynote`+. Per-slide
  effects are opt-in on the section itself — `data-fx="ember|aurora|mesh|motes|pixels|spot"`,
  plus `data-fx-over` to blend it over the content. Headlines can take
  `data-fx-text="particles|mask|elastic"`, cards can take `.glass`. Use them on hero
  slides only: a shader behind a table is noise, every slide glowing is the same as
  none, and a signature move used twice stops being one. Full list: `styles.md`.

  (Editing the engine file by hand also works, but pasting HTML into the commented
  demo region is how you end up with a deck that has 34 slides. Use the script.)
- Build each slide from a `formats.html` block. **Vary the format every slide.**
- Keep the whole deck in ONE file. Images live in `images/` beside it.
- Respect the word budgets. A slide is a headline plus evidence, not a document.
- `data-anim` on every element that should reveal; `data-count` on every big number.
- **Notes come from the storyboard, not from scratch.** Each slide's `note:` (with
  any edit the user made on the board) becomes its `<aside class="notes">` verbatim.
  Only expand where the build revealed something the storyboard couldn't know.
  Everything else that got cut from the slide goes here too — written to be spoken,
  not read. That is what the on-slide text is short *for*: the argument moves to the
  notes, it doesn't disappear. Notes never render on the
  slide. `s` opens a notes panel docked in the same window (fine for rehearsing);
  `⇧S` opens a **separate presenter window** for a second screen — notes, next
  slide, elapsed timer and its own Back/Next, synced both ways over a
  BroadcastChannel so either window can drive. That is the one to use when
  projecting: the audience never sees the notes. A deck with no notes can't be
  handed to anyone else to present, and the QA script says so. When converting a `.pptx`, its notes are the best content in the file — carry
  them across.

### 5b. Imagery — stock, generated, or none

Only where the deck actually wants a picture — a cover, a section divider, one
spot illustration. Most content slides are better with none, and **never** put art
on a slide that already carries a chart, a table or a diagram.

Follow the **Imagery** answer from step 2. Both paths end the same way: a file in
`images/`, referenced by one of the treatments in `styles.md` § Images.

**Stock — free, try this first for anything real.**

```bash
node scripts/fetch-photo.js --query "empty dark auditorium rows of seats" --n 6   # look
node scripts/fetch-photo.js --query "…" --pick 3 --out images/urgency.jpg         # take
node scripts/fetch-photo.js --query "…" --n 4 --sheet images/cand/urgency         # contact sheet
```

Downloads `large2x` (~1880px — right for a 1280 stage, a tenth of the bytes of
`original`) and appends photographer + Pexels URL to `images/credits.json`. The
`pexels` MCP (`photos_search`, numeric args as **strings**: `per_page:"6"`) is the
interactive way to browse; the script is what actually fetches and records
attribution. **Look at the candidates before choosing** — stock is free, so the
cost of a lazy pick is a cliché on your cover, not money.

**Generated — when stock can't be it.**

```bash
node scripts/gen-art.js --prompt "…" --style "…" --out images/cover.png --model pro
```

**Ask before generating** — this spends the user's fal.ai credit. Say which slides, how
many images, which model, and the total (`schnell` ~$0.003 each for drafts, `pro`
~$0.04 for finals). Draft cheap, then regenerate the keeper at `pro`.

The rules that matter for generated art: the image model never renders words
(guard is automatic); reserve the copy zone in the prompt *and verify it in the
render*; never say "cinematic"; keep one `--style` string for the whole deck.

**Either way** — put the candidates on the storyboard (step 4). Stock art goes in
as `art:{source:"pexels", candidates:[…]}` and renders a clickable strip, so
the user picks the actual photograph before the deck exists; the pick comes back in
the verdict export. Generated art goes in as a `schnell` draft.

```bash
node scripts/gen-art.js --prompt "…" --style "…" --out images/cover.png --model pro
```

**Ask first — this spends the user's fal.ai credit.** Say which slides, how many images,
which model, and the total (`schnell` ~$0.003 each for drafts, `pro` ~$0.04 for
finals). Draft the composition cheap, then regenerate the keeper at `pro`.

The rules that matter: the image model never renders words (guard is automatic);
reserve the copy zone in the prompt *and verify it in the render*; never say
"cinematic"; keep one `--style` string for the whole deck. Full guidance and the
`.bleed.art` / `.bleed.right` treatments: `references/styles.md` § Images.

### 5c. Humanize the copy — every deck, before QA

Run the `humanizer` skill over `slides.html` before you render. Decks are the worst
offender for AI tells: headline copy is written to sound weighty, and speaker notes
are generated prose that the presenter then has to say out loud in a room. A note they
wouldn't actually say is worse than a note that's missing.

Apply it to **slide copy and speaker notes both**, and leave the markup alone —
class names, `data-` attributes, chart JSON and the `–` glyphs inside `.mark` spans
are not prose.

The five that survive a deck build most often:

- **Em dashes.** They are the loudest AI tell. Replace with a colon,
  a comma, a semicolon or a full stop. Headline dashes too: `October: pilot one
  church`, not `October — pilot one church`.
- **Not X but Y**, including the split-across-sentences form and the clipped tail
  (`Name and email only — no signer change`). Keep the contrast only when both
  halves carry information, as in `An online user, not a signer`.
- **One-line closers** in the notes that restate the slide instead of adding what
  the slide had to cut.
- **Inflated significance** — `the deliverable that outlives the quarter`, `this is
  the real win`. State what the thing is and what it's for.
- **Sayings that sound deep** — `this is the shape of the thing`, `at its core`.

Keep what makes it sound like the presenter: a real aside, an honest caveat about what
isn't in our hands, a line like *do one properly before doing seven badly*. The
goal is prose they can read off the presenter screen without flinching.

### 6. Visual QA — screenshot, read, fix, repeat

```bash
node scripts/qa-render.js <deck>.html --out qa
```

Run it from a folder where a resolvable
`playwright` lives. If the browser binary is missing (`Executable doesn't exist …
chromium_headless_shell`), it's the known version-bump gotcha: `npx playwright
install chromium`.

It renders every slide at 1280×720 and flags: content painted outside the stage,
clipped text, charts that drew nothing, broken images, leftover placeholder copy,
walls of text, sub-13px type, JS errors — plus the two rhythm rules (same format
twice in a row, more than six content slides without a breather) and a count of
slides missing speaker notes.

1. Fix every **FAIL**. Re-run. Loop until it exits 0.
2. **Then actually look.** `Read` the PNGs — at minimum the cover, every chart
   slide, and any slide the script warned about; on a deck under ~15 slides, all
   of them. The script cannot see ugly: awkward line breaks (a two-word orphan
   line), a stat card with three words in one and fifteen in the next, an image
   cropped through someone's face, a chart whose bars are all one height, two
   adjacent slides that look identical.
   Judge each one on the three-second test: **would someone get the point before
   they finish reading it?** If the slide only works once you read every word, it's
   a document page. And check the deck as a whole — flip through all the PNGs at
   once: does it look like one system, or like fifteen tidy card layouts?
3. Fix what you saw. Re-run. Repeat until you would present it yourself.
4. If a theme other than the default might be used, re-run with `--theme dark`
   — dark mode is checked, not assumed.

Do not report the deck as done until the QA loop has actually run and you have
looked at the images.

### 7. Deliver

- `open <deck>.html` so it's in front of the user.
- Tell them the keys: `→ / space` next, `←` back, `g` overview grid, `s` notes
  panel, `⇧S` presenter window on a second screen, `f` fullscreen, `t` cycle theme, `p` print/PDF, `?` help — and the two
  review keys, `c` to pin a comment and `e` to edit text in place (see *Revising*
  below). Say it once, in one line; `?` has the rest.
- Ship the PDF too — `node scripts/to-pdf.js <deck>.html` (or `p` in the browser →
  Save as PDF, landscape, margins none). People always ask for a file.
- **Sending it to someone else — bundle it first.** A built deck references
  `images/`, so emailing the bare `.html` arrives with every picture broken. Inline
  them:

  ```bash
  node scripts/bundle.js share-<deck>.html --out "<Nice Name>.html"
  ```

  One file, opens from an email attachment or a USB stick with no wifi, and keeps
  everything a PDF throws away: animations, transitions, shaders, **speaker notes**,
  the presenter window, theme switching. Bundle the `images-web` (JPEG) build, not
  the full-res PNG one — base64 adds ~33%, so the difference is ~6 MB versus ~70 MB.
  Offer this whenever the user asks how to send a deck; the PDF is only the right
  answer when the recipient just needs to read it, or must annotate it.
- Offer one round of edits — decks always get one.
- If someone else has to present it or edit it in Slides, offer the PDF in Drive
  via the Workspace MCP (ask first — that's outbound). The speaker notes travel in
  the HTML, not the PDF, so send the HTML to whoever is presenting.

## Revising a deck that already exists

A built deck is not a dead end. Four ways back in, cheapest first.

**The user revises the speaker notes** — edit mode does NOT reach them (the engine
bails on anything inside `.notes`, and notes are `display:none`, so there is nothing
to click). Generate the notes editor instead:

```bash
node scripts/notes-review.js slides.html
```

That writes `notes-review.html` next to the deck: all notes as textareas, word
counts, a dirty flag per note, "Read all"/"Discard my edits", and **Copy changed
notes** which exports only the ones they touched. Read-only against the deck — apply
the export by editing `slides.html` and re-running `new-deck.py`. Offer this
whenever they ask about notes, or after any pass that changed on-slide wording (the
notes usually still carry the old phrasing — that is how a renamed term survives in
the notes after being fixed on the slides).

**The user edits the slides themselves** — `e` turns on edit mode (headlines, body,
bullets, table cells, stats all become editable in place), `⌘S` saves. That needs
the save server running:

```bash
node scripts/edit-server.js <deck>.html
```

It serves the deck on `http://127.0.0.1:4179`, writes edits back into the deck
**and** into `slides.html` so the source never drifts, and keeps every previous
version in `.bak/`. Without the server, `⌘S` downloads an edited copy instead —
usable, but then hand me the file. Edited a number? The count-up animation
re-reads it automatically on save.

**The user marks up what they want changed** — `c` turns on comment mode: click any
spot on a slide, type the note, a pin drops there. `x` copies the **open** comments
as markdown anchored to slide + nearest element:

```
- **Slide 19 · The whole programme** (near "$264K"): is this all-in or just the contract?
```

They paste that to me and I apply the batch. **Comments have a resolved state, and
`x` exports only the open ones** — an applied comment must never come back next
round. Copying offers to resolve exactly what it just handed over (that is the
moment they know it's been passed on); a resolved pin dims to a ✓, stays on the deck,
and can be clicked to reopen. `⇧R` resolves all open ones, `⇧X` deletes every
comment outright. The mode banner reads `3 open · 8 resolved`.

If a round of feedback arrives with items you already applied, that means the
resolve step got skipped — apply what's new, say plainly which ones were already
done rather than redoing them, and tell them `x` now offers to resolve on copy.
Comments live in localStorage — they never touch the file and never print.

**Rebuilding** — `new-deck.py` always backs the old deck up to `.bak/` first, and
prints a loud WARNING if the deck on disk no longer matches `slides.html` (i.e. it
holds browser edits). If you see that warning, stop and reconcile before you
overwrite someone's work.

Offer the right one: a typo is edit mode, "this slide is wrong" is a comment,
"what I say here is off" is `notes-review.js`, "redo the money section" is a rebuild.

## Hard rules

- **One self-contained HTML file.** No CDN, no npm, no bundler. It has to open
  from a USB stick on a stranger's laptop in a church basement with no wifi.
- **Never hardcode a colour.** Only `var(--…)` tokens, so `t` still works.
- **Max 3 chart series** (validated colour-blind-safe palette order) and never a
  dual-axis chart.
- **Never fabricate data.** Placeholders are visible: `[figure TK]`.
- **Don't touch the source file.** A `.pptx` being converted is read-only input.
- **Don't send or publish anything.** Building a deck is local. Emailing it,
  putting it in Drive, or publishing it as an Artifact needs the user's explicit yes.

## Making it better over time

This skill is meant to be edited. When a generated deck needs the same manual fix
twice, the fix belongs in `deck-engine.html` (if it's mechanical) or in
`styles.md` (if it's judgement) — not in the next conversation. New layout you had
to hand-build? Add it to `formats.html` as format 15.
