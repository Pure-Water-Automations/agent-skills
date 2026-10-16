# Building the before/after visual report

The visual is the deliverable. It must let a non-technical owner *see* the problem and the fix without reading paragraphs. Build it with the `mcp__visualize` tools.

## Procedure
1. **`read_me`** with `modules: ["mockup","diagram"]` and the right `platform` (the read_me is large — it's fine to skim for the constraints below; you don't need every line).
2. **`show_widget`** with one self-contained HTML report. Start from `assets/report-template.html` (sibling `assets/` folder) — it has the reusable device-frame CSS and a section skeleton, so you're not rebuilding styles each run.

## The faithful-before / calmer-after principle
- **Before = depict the *actual* product.** Use its real colors, density, capitalization, and labels inside a device frame (a little browser/phone chrome). This is *content* — a mockup of their app — so showing a dark, neon, ALL-CAPS UI here is correct and not a violation of the host's calm style.
- **After = the same visual family, calmed.** Keep the product's identity (don't reskin it to a generic light theme — that wrongly implies "the fix is switching themes"). Change what actually fixes usability: sentence-case labels, plain words, a clear hierarchy, one accent color, and good/watch/neutral signal chips on numbers. The before is dark-and-busy; the after is the *same app, legible*.

## Required sections (in order)
1. **Scorecard** — 3 cards, one per lens: big letter grade + lens name + the one-line core problem. Color the grade by severity.
2. **Before → after pairs** for 3–4 key screens. Always include:
   - **The front door + navigation** (entry point; how they get around).
   - **One "read" screen** (e.g., the overview/stats screen) — show raw numbers → numbers with plain meaning + signal chips.
   - **The core action** (the main job) — show buried/jargon/dead-end → surfaced/plain/closed-loop (assign + status).
   Lay out before/after side-by-side (2-col) where it fits 680px; stack if cramped.
3. **Plain-language relabel glossary** — a two-column table: "what it says now" (in `code` style) → "what [user] reads easily". This is usually the highest-impact section; don't skip it.
4. **Recommendations** — two boxes: **Quick wins** (copy + layout, ship this week) and **Bigger bets** (structure: home/launchpad, nav consolidation, close-the-loop, tone).
- Annotate "before" frames with small numbered red markers (①②③) and a short legend underneath — leader lines are hard in HTML, so markers + legend read cleanly.

## Widget constraints & gotchas (from the visualize design system)
- Container is **~680px wide**; the **outer** container must be transparent (the host provides the page bg). Your device frames carry their *own* background — that's fine, it's mockup content.
- **Your chrome** (scorecard, glossary, headings, captions, legends) must follow the host style: **sentence case** (never ALL-CAPS), **two font weights only** (400 / 500 — never 600/700), and **host CSS variables** for text/border colors (`var(--color-text-primary)`, `--color-text-secondary`, `--color-text-success`, `-warning`, `-danger`, etc.) so it adapts to light/dark mode.
- ALL-CAPS / heavy styling is allowed **only inside the "before" device frame** because there it depicts the product.
- **No `position: fixed`** — the iframe sizes to in-flow content, so fixed elements collapse it. For overlay/modal mockups, use a normal-flow faux-viewport `div` with `min-height`.
- Icons: **Tabler** via cdnjs only (CDN allowlist: cdnjs, esm.sh, jsdelivr, unpkg, fonts.googleapis/gstatic). `<i class="ti ti-...">`, sized 16–20px.
- Start with a visually-hidden `<h2 class="sr-only">` one-sentence summary for screen readers.
- No DOCTYPE/`<html>`/`<head>`/`<body>` — just the fragment. A `<style>` block is fine.
- Keep on-canvas text to labels, short captions, and the glossary/recommendations — the narrative goes in the chat response, not the widget.

## Faithful-before color cheatsheet
When mirroring a dark "cosmic/terminal" product (e.g. a dark dashboard with neon accents): bg `#0a0a0b`, panels `rgba(255,255,255,.04)`, borders `rgba(255,255,255,.1)`, accents cyan `#67e8f9` / amber `#fcd34d` / teal `#5eead4` / signal-red `#ef4444`, mono numbers, uppercase letter-spaced micro-labels. For the **after**, shift the panel bg to a calmer slate (`#11161f` / cards `#1a2130`), one primary accent (teal), sentence case, and add `good #86efac / watch #fcd34d / neutral` signal chips. Adjust to whatever the audited product's real palette is.
