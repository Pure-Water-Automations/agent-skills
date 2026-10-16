---
name: app-scorecard
description: Score any app (the user's own or a competitor's) on a research-backed rubric and produce a reusable, comparable scorecard — 0–5 per dimension with an evidence grade, noncompensatory gates checked first, and one "smallest fix" per weak dimension. Adapts to product stage: a pre-PMF app under ~100 users is scored on 9 dimensions, a growth-stage app on the full 23. Use whenever the user says "score this app", "grade the app", "rate the UI/UX", "how good is [app]", "app scorecard", "run the scorecard on [app]", "how does [app] stack up", "is this ready to launch / promote to prod", or wants a before/after number after a build sprint or a beta round. Reads the codebase + deploy + docs, optionally beta feedback / analytics, and refuses to invent retention, revenue, or PMF from code alone. Outputs a chat table plus a published HTML scorecard artifact. Pairs with ui-usability-audit (UI depth), qa-sweep (functional pass), dev-to-prod-promotion-review (release gate).
user-invocable: true
---

# App Scorecard

If a LOCAL.md file sits next to this SKILL.md, read it first — it holds this workspace's specifics (paths, tools, examples) and overrides the generic defaults below.

One rubric, every app, every time. The point is **comparability**: the same
dimensions, the same 0–5 anchors, the same gates, so an app scored in March can
be scored again in June and the delta means something, and two apps can be
compared without re-arguing the criteria.

Built from the "What Makes an App Exceptional" research report
(`references/framework-source.md`) plus targeted research to fill its gaps
(`references/research-notes.md`). Worked example of a full 23-dimension run
(anonymized): `assets/example-audit.html`.

## Principles (read once, they govern everything)

1. **Gates before scores.** Security, privacy, legal, accessibility, and — for
   any app that asserts facts — content correctness are noncompensatory. A 5 in
   design cannot offset a 0 in privacy. List open gates first; never average.
2. **Evidence outranks opinion.** Every score carries an evidence grade
   (E0 assertion → E4 durable) and every finding is tagged
   **Observed / Inferred / Hypothesis / Unknown**.
3. **Never infer behaviour from code.** Retention, engagement, market fit,
   satisfaction, revenue are **unknown** unless there is telemetry, cohort data,
   or a survey. Code and screenshots cannot prove them. Say "unknown", not "likely".
4. **Stage decides the rubric.** Pre-PMF apps are judged on whether they are
   *learning*, not whether they have SLOs. See `references/stages.md`.
5. **Cadence over benchmarks.** No universal D7 retention. A weekly job used
   "a few times in two weeks" is healthy. Name the natural cadence first.
6. **Every weak dimension gets a smallest fix.** A scorecard without fixes is a
   complaint. One line, reversible, sized in hours or days.

## Workflow

### 0 · Frame (5 minutes, do not skip)

Pin, in one line each: **target user · primary job · natural cadence ·
first-value event · business model · main alternatives (incl. "do nothing")**.
If the repo has `AGENTS.md` / `README.md`, take these from there and quote them.
If missing, infer, state the assumption, proceed.

Then pick the **stage** (`references/stages.md`):

| Stage | Signal | Rubric |
|---|---|---|
| **Pre-PMF** | < ~100 active users, no cohort data, or Sean Ellis "very disappointed" < 40 % | 9 dimensions + gates |
| **Growth** | Cohorts exist, > 100 actives, or paying customers | full 23 + gates |
| **Idea / spec** | No code yet | hypothesis-quality rubric only (stages.md §3) |

### 1 · Gather evidence (parallel where possible)

**Always (code + deploy):**
- Routes / screens, API surface, auth + authorization enforcement (server-side?)
- Tests: run them. Lint: run it. CI: read the workflows. Deploy: read the script.
- Telemetry: what is actually *sent*? (An analytics import that targets a
  platform the app isn't hosted on counts as **nothing**.)
- Store / DB: what is written per user, is there deletion, is there backup.
- Privacy / terms / deletion routes. Rate limits and quotas on paid APIs.
- Accessibility greps: `aria-`, `alt=`, `focus-visible`, `prefers-reduced-motion`, labels.
- i18n coverage: strings externalized vs hard-coded, locales, plural/date rules.
- Error/empty/loading/offline states; route-level `error.tsx` / `not-found.tsx`.
- Performance: heavy data server- or client-side, caching, p95 if logged.
- For AI / reference apps: attribution + citation logic, grounding guard,
  hallucination controls, corpus provenance.

**When available (behaviour):** beta form, analytics, cohort tables, support
tickets, Sean Ellis survey results, observed sessions. These lift dimensions
from "unknown" to a real score. Without them, leave unknown.

Fan out read-only `Explore` agents for breadth (max 3 concurrent); read the
entry point, nav, core flow, auth, and store yourself.

### 2 · Check the gates

From `references/rubric.md §Gates`. Each gate is **open / closed / n-a** with
the observed evidence. Open gates go at the top of every output. Common ones:
no privacy policy or deletion path while collecting PII; payments without
terms; server-side auth missing; no reduced-motion with animations for an
older audience; misattributed or uncited content in a reference app.

### 3 · Score each dimension

For each dimension in the chosen rubric (`references/rubric.md`):
- Score **0–5** using the anchors in the rubric (not vibes).
- Evidence grade **E0–E4** and tag Observed / Inferred / Unknown.
- Tick the dimension's checklist: present / partial / missing / unknowable.
- One-line finding grounded in a `file:line`, a route, a config, or a quote.
- One-line **smallest fix** if score ≤ 3.

For **UI / UX design** use the visual-design sub-rubric in `rubric.md §UX
Design` (typography, hierarchy, colour, spacing, consistency, copy). If the user
wants depth here, invoke `ui-usability-audit` after the scorecard and reference
its letter grades.

### 4 · Judge

- Open gates (again, first).
- Top 3 reasons to win · top 3 reasons to fail · top 3 unknowns.
- The single highest-leverage next experiment or fix.
- Verdict: **Go / Conditional Go / Iterate / No-Go**, with confidence.
  Rule of thumb: any open gate ⇒ at best *Iterate*; all gates closed + value
  event instrumented ⇒ *Conditional Go*; four weeks of retention data at the
  natural cadence ⇒ *Go* is on the table.

### 5 · Deliver — the visual scorecard is the deliverable

The chat message is a summary. **The published HTML scorecard artifact is the
output.** Never finish a run without one; if the Artifact tool is unavailable
(Codex, a subagent), write the HTML to `docs/scorecards/<date>-scorecard.html`
in the app repo and send/open the file instead.

1. **Build the artifact** from `assets/scorecard-template.html`. Load the
   `artifact-design` skill first, then keep the template's structure exactly,
   in this order, so every app's scorecard reads the same way:
   1. **Header** — `<App> Scorecard`, stage + evidence sources + date eyebrow,
      one-sentence thesis, verdict chip (`go` / default amber / `nogo` class),
      confidence, and the framing strip (user · job · cadence · value event ·
      alternatives).
   2. **At-a-glance grid** — one tile per dimension, score band coloured
      (teal ≥ 3, amber 2, red ≤ 1, grey unknown), `gate` outline on any
      dimension with an open gate, and a ▲/▼ delta vs the previous run when
      one exists.
   3. **Gates** — every gate as a card: open (red) or closed (green), with
      the observed evidence and file/route names in `code`.
   4. **Per-dimension cards**, grouped (strategy & economics · experience &
      trust · engineering & scale, or the Tier A list): score, evidence
      badge, 2–4 sentence finding, checklist with present/partial/missing/
      unknowable marks, and the smallest-fix line for anything ≤ 3.
   5. **Final judgment** — three columns (reasons to win · reasons to fail ·
      critical unknowns) and the dark "highest-leverage next step" panel.
   6. **Method footnote** — what was read, run, refused; link to previous run.
   Design rules: real content only, no lorem; every colour from the token set
   so dark mode holds; no emoji, no decorative charts; digits in tabular mono.
   Look at the rendered page once, fix what that shows, publish.
2. **Publish** with `Artifact`. Title `<App Name> Scorecard`, favicon 🔬
   on first publish only. **On a re-run, pass the previous artifact's `url`**
   so the history stays at one link (find it in `docs/SCORECARD.md`).
3. **Chat**: link first, then the framing block, open gates, a compact table
   (dimension · score · evidence · finding), verdict. Terse. Do not
   duplicate the artifact's prose.
4. **Persist** a row in the app repo's `docs/SCORECARD.md` (create if absent):
   `date · stage · gates open · per-dimension scores · verdict · artifact URL`.
   Commit only if the user asks.

## Rules

- **Read fully, then score.** The rubric shortens judgement, never the reading.
- **Quote, don't paraphrase, when a tester or a file says the thing.**
- **Refuse to score what can't be known.** "Unknown" is a valid, honest cell.
- **Do not invent benchmarks.** The only numeric thresholds you may cite are
  the ones in `references/research-notes.md` (SUS 68/80, Ellis 40 %, CWV
  2.5 s / 200 ms / 0.1, Nielsen severity 0–4, WCAG 2.2 AA, ASVS L1). Anything
  else is a comparison to the app's own previous run.
- **Same rubric across apps.** Do not add or drop dimensions per app. Mark
  n-a when a dimension genuinely does not apply (e.g. Monetization on an
  internal tool) — n-a is recorded, not skipped.
- **Dev/staging only** if you need to drive the live app. Never prod.
- **Read-only.** The scorecard recommends; it does not edit the app.
- **No artifact, no run.** A scorecard that lives only in chat scrollback is
  not comparable next quarter. Always publish (or write the HTML file).

## Composes with

- `ui-usability-audit` — depth on the UX Design dimension, visual before/after.
- `qa-sweep` — functional PASS/FAIL that feeds Reliability and Core UX.
- `dev-to-prod-promotion-review` — the scorecard's verdict is an input to the
  release gate.
- `panel-brainstorm` — when the "smallest fixes" need alternatives generated.
