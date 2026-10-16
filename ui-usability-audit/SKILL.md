---
name: ui-usability-audit
description: Audit a UI/app for ease of use — usability, navigability, and how intuitive it is to learn — through the eyes of a specific target user, then deliver a VISUAL before/after report (a designed widget with side-by-side "now → clearer" mockups, a plain-language relabel glossary, and prioritized fixes). Use whenever the user says "audit this UI/app", "is this confusing for [a pastor / VA / new user / customer]", "review the UX / usability of [app]", "how intuitive is this", "make it easier to use / navigate / learn", "what could be improved about [app]'s interface", "show me what it looks like now vs what it could look like", or wants a before/after UX report. Works on a codebase (reads the real front-end source — routes, components, copy) OR on screenshots / a live URL when there's no source. Better to over-trigger on any "is my interface easy to use / how do I make it clearer" request than to miss it.
user-invocable: true
---

# UI Usability Audit

If a LOCAL.md file sits next to this SKILL.md, read it first — it holds this workspace's specifics (paths, tools, examples) and overrides the generic defaults below.

Audit an interface for **ease of use** and turn the findings into a **visual before/after report**. The output that makes this skill worth running is not a list of complaints — it's a designed artifact a non-technical owner can look at and immediately *see* the problem and the fix.

## The one principle that makes the audit good

**Judge the UI through one specific user doing their real jobs — never in the abstract.** The best audits land because they ask "can a *pastor and their volunteer ministry team* actually use this?", not "is this good UX?". A heuristic only matters if it blocks *that* person from *their* task. So every run starts by naming the user and their top jobs, and every finding is phrased as "this gets in [user]'s way when they try to [job]."

## Workflow

### 0 · Establish the lens (do this first, always)
Pin down two things before looking at anything:
- **Who is the user?** (e.g., "a busy pastor + volunteer ministry team", "a VA onboarding day one", "a paying customer"). Note their tech comfort.
- **Their top 3–5 jobs-to-be-done.** What did they open this to *accomplish*?

If the user gave the lens (e.g., "think in terms of a pastor and their team"), use it verbatim. If not, infer the most likely user from the app, **state your assumption in one line**, and proceed — don't stall on a question you can answer.

### 1 · Map the real UI
**Codebase path (preferred when source exists):** find the screens and, critically, the *actual user-facing words*. Jargon and confusion live in the copy, not the architecture.
- Routes/screens, the navigation structure, the primary components per screen.
- The real labels, headings, button text, empty/loading states, tooltips, toasts.
- For breadth, fan out a read-only `Explore` agent over the remaining components while you read the entry point + nav + the 2–3 core screens yourself.

**Screenshot / URL path (no source):** enumerate the screens given, the visible nav, and every visible label/control. Ask for the entry screen + the main task screen if missing.

### 2 · Walk the journey as that user
Trace the real path and note friction at each hop:
**entry point → orient ("where am I, what do I do?") → read status → do the core action → close the loop.**
This is where you find: no home base, nav hidden/overlapping, jargon walls, numbers without meaning, dead-end actions.

### 3 · Score the three lenses
Grade each, give a letter + the single core problem. Rubric and per-lens checklists are in `references/heuristics.md` — read it.
- **Intuitive learning** — can they understand it without training?
- **Navigability** — can they find things and move between them?
- **Usefulness** — does it actually help them do the job?

### 3b · Design principles pass: the guidelines, not the look
Run the 15-point checklist in `references/design-principles.md`. It covers hit targets, the type floor, semantic color tokens, visible focus, assistive labels, the icon system, reduced motion, component consistency and navigation pattern. The rules come from Apple's HIG and are translated for the web. Grade the result as a fourth scorecard row, **Fit and finish**. **Never recommend adopting Apple's (or any platform's) visual style** unless the user asks for it. The product keeps its own identity, and only the fundamentals get fixed. Back each finding with grep counts ("299 hex literals", "0 focus-visible styles").

### 4 · Pull the highest-leverage findings (evidence-grounded)
- Quote the **real** label/number and cite `file:line` (codebase) or the screen (screenshots). No vague "the copy is unclear."
- Separate **Keep** (genuine strengths — name them so the audit isn't just negative and so a rebuild doesn't throw them out) from **Fix**.
- Rank by leverage: what unblocks the most jobs for the least effort.

### 5 · Build the VISUAL before/after report
This is the deliverable. Use the `mcp__visualize` tools (`read_me` with modules `["mockup","diagram"]`, then `show_widget`). Full build spec + widget gotchas are in `references/visual-report.md`; start from the CSS/skeleton in `assets/report-template.html` so you don't rebuild the device-frame styles each time.

The report always contains, in order:
1. **Scorecard**: the 3 lenses plus **Fit and finish** (step 3b), each with a letter grade and the core problem in one line.
2. **Before → after pairs** for 3–4 key screens: the entry/nav, one "read" screen, and the core action. *Before* = faithful to the real product (its actual colors, density, caps — shown as a device frame, i.e. content). *After* = the **same visual family, calmed and clarified** (so it reads as "language + clarity," not "we swapped to a light theme").
3. **Plain-language relabel glossary** — a "what it says now → what [user] reads easily" table. Almost always the highest-value section.
4. **Recommendations** — split **Quick wins** (copy/layout) vs **Bigger bets** (structure).
Annotate "before" screens with numbered red markers + a short legend.

### 6 · Write the chat summary (don't duplicate the widget)
The visual carries the comparison. In chat, add what it can't: the one-line thesis, the code-grounded findings (with `file:line`), the strengths to keep, any risk worth a decision, and a concrete next step ("want me to ship the quick wins as a diff, or write a plan for the structural moves?").

## Heuristics that consistently surface the real issues
These are the patterns that produced the best findings; details + how-to in `references/heuristics.md`.
- **Jargon → plain glossary.** List every game/internal/acronym term and propose the word the user would actually say. (e.g. "Harvest radar" → "Who to follow up with"; "YTD net" → spell it out.)
- **Numbers need meaning.** Every metric needs a plain interpretation + a good / watch / neutral signal. "127.8% of goal" alone is useless to a layperson.
- **Front door & nav.** Is there a real home/launchpad, or does the user land with nothing to do? How many overlapping surfaces? How deep does the nav nest?
- **Close the loop.** Do actions give feedback/status, or do they dead-end ("Queued ✓" then nothing)?
- **Tone fit.** Does the product's voice match the user's world? (A competitive leaderboard can demotivate a struggling ministry; military/gaming framing can alienate.)
- **Readability quick-scan.** Tiny text, low contrast, ALL-CAPS scanning cost, mobile cramping.
- **Preserve strengths.** Always name what's working so it survives the redesign.
- **Principles over looks.** Keep the brand and fix the fundamentals: 44px targets, an 11px text floor, tokens, a focus ring, real icons and reduced motion. See `references/design-principles.md`.

## Scope notes
- This is a **design/UX critique**, not a code-quality or security review. Read source only to find what the *user* experiences (screens, copy, flows) — don't audit implementation correctness.
- Subjective by nature: aim for findings that are concrete, evidence-cited, and obviously actionable, not a numeric score.
