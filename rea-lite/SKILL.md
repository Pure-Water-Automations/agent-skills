---
name: rea-lite
description: >-
  Use when the user wants one of their apps to work like a reference product —
  "make it feel like Miro", "copy Notion's/Linear's/Loom's X", "get it on par
  with <app>", "add all the essential <app> options", "check how <app> does it
  and match it", "REA", "REA lite", "parity with". Loop: observe the reference
  app live in the browser, write measured evidence, batch the gaps into rounds,
  have a background builder agent build each round, merge, test desktop + iPhone, polish, deploy
  only on a Yes. NOT for a design proposal to look at before building (use
  competitive-redesign) or a pure QA pass (use qa-sweep).
---

# REA lite — copy a reference app's behaviour, round by round

If a LOCAL.md file sits next to this SKILL.md, read it first — it holds this workspace's specifics (paths, tools, examples) and overrides the generic defaults below.

Our light version of REA (Reverse-Engineer, Evidence, Act — github.com/morluto/rea):
**observe the real thing → write evidence → implement → retest against the real thing**.

You (main session) are the **observer, reviewer and tester**. Builders are background agent
jobs: any headless coding agent that takes a self-contained brief, works in its own git
worktree and commits to a branch (e.g. `claude -p` on a second account). The user decides
scope and deploys.

## 0. Scope (ask once, multiple choice)

- Reference app + the exact area ("the whiteboard tools", "home page + board menu", "Essentials list").
- Our app repo + local dev URL (start it with the Browser preview, `.claude/launch.json`).
- Bar: **same behaviour for the tools we already have** (default) vs **add the reference's missing features too**.
  Never copy brand, wording or assets — behaviour, layout ideas and measurements only.

## 1. Observe (you, in the built-in browser)

- The user signs in to the reference app themselves (never type credentials). Use a scratch board/page.
- Set a real viewport first: `resize_window` 1440×900, zoom the reference to 100%. Reset to desktop when done.
- Coordinates: clicks by `coordinate` use the LAST screenshot's frame (often 800×500 scaled); clicks by `ref`
  use real pixels. Don't mix them up — prefer `find` → `ref`.
- Cheap, exact evidence beats screenshots:
  - dump a toolbar/menu: `javascript_tool` → list `aria-label` / `data-testid` / text of buttons in it;
  - open each menu (row "⋯", board menu, context bar, Tools/"+" panel) and copy the item list verbatim;
  - measure at 100% zoom: default sizes, gaps, offsets, handle sizes, colours, which step a +/− button takes;
  - note what happens after an action (tool stays active? object enters edit mode? panned into view?).
- Anything you could not see live is marked *(docs)* in the evidence — never present a guess as observed.
- Gotchas: some apps write to the clipboard on synthetic clicks (tell the user); a page-opened popup
  blocks all navigation in the pane until the user closes it; delayed renders — wait 1–2 s before judging.

## 2. Evidence doc (in our repo)

`docs/<REFERENCE>_PARITY.md`, one section per round:

| # | <Reference> (observed) | Ours today | Change |
|---|---|---|---|

Keep ids stable (G1…, E1…) so builders, tests and commits can cite them. Commit the doc before building.

## 3. Build in rounds (background builders)

- 3–6 rows per round, grouped by the files they touch. **Same file (e.g. one big editor) → rounds run
  in sequence. Disjoint files → run in parallel** (separate worktrees, merge both).
- Brief = `references/brief-template.md` filled in. It must be self-contained: the builder has no chat context.
- Launch the builder in the background in its own worktree of `<repo>` with the brief as its prompt
  (e.g. `claude -p "$(cat brief.md)"`; use your strongest model).
- **A launcher wrapper can exit while the worker is still running** (its report says `status: running`). Wait on the worker:
  `while pgrep -f "claude -p --output-format json.*<unique brief phrase>"; do sleep 30; done`.
- A worker that stops early leaves uncommitted work in its worktree: commit it as `WIP` on its branch and
  relaunch with a "CONTINUATION: cherry-pick <sha> first, then finish everything below" brief.

## 4. Review + merge (you)

- Read the round's status note in the evidence doc ("Not done / differences").
- `git merge --no-ff <branch>`; doc conflicts → keep both sides; `npx tsc --noEmit`; full tests on a scratch DB.
- Schema changed? `npx prisma generate` + `npx prisma migrate deploy` on the dev DB, then restart the dev
  server (stale client = runtime errors that look like bugs).
- Never `npm run build` in the main checkout while the dev server runs (clobbers `.next`); builders build
  in their worktrees. Don't `pkill` broad patterns — you can kill the dev server.

**Timelapse:** capture a UI timelapse before round 1 and again after every merged round with the `ui-timelapse` skill (if installed),
so each round's change is on record as real screenshots. Link the player in the report.

## 5. Retest against the reference (you)

- Desktop: do the same actions you observed in step 1 on our app; compare numbers and behaviour.
- iPhone simulator (`mcp__Claude_Code_iOS_Simulator__control`): one-finger use, pinch, sheets at 390 px.
- Two tabs for anything live/shared (sync, timers, presence).
- Every mismatch → a row in a **polish round** (one more builder job). Typical polish: Enter/arrow keys in
  search panels, new objects not panned into view, new objects not in edit mode, chrome overlapping toolbars.

## 6. Ship (only on the user's Yes)

Ask with options (push + deploy / push only / hold). Deploy with the repo's guarded deploy script; confirm
health and that the live commit = HEAD. Update the repo AGENTS.md / registry entry if routes or features changed.

## Report back

Lead with what now matches, then what deliberately doesn't (listed in the doc), tests, and what's live. Include the timelapse player link when you captured one.
