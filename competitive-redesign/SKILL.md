---
name: competitive-redesign
description: >-
  Use when the user wants to improve or rethink a feature of one of their apps by
  learning from competitor products — "look at how Loom/Notion/Linear does
  it", "spin off agents to screenshot ours and competitors", "what can we
  learn from other apps for X", "benchmark our X against Y", "how can we
  improve the organization of X" — especially when they also want to SEE the
  proposal (a before/after design of the improvements, current UI beside the
  redesign with the new pieces highlighted) before anything gets built.
---

# Competitive redesign

If a LOCAL.md file sits next to this SKILL.md, read it first — it holds this workspace's specifics (paths, tools, examples) and overrides the generic defaults below.

Research → decide → design. Parallel subagents screenshot OUR feature and 2-3
competitor products, the findings become a gap analysis with batched
decisions for the user, and the chosen direction becomes a design canvas:
current-UI screenshots beside redesigned artboards with every delta marked.
Output is a decision + a design (+ optionally an implementation plan) — no
product code gets written by this skill.

The "reference run" mentioned below is this skill's first real run (a
recordings-library redesign); LOCAL.md, when present, points to it. Worked
example only — it proves the shape and calibrates depth; don't consult it for
a new feature's content.

## Phase 0 — Record the baseline (when the app's source is in git)

Capture a UI timelapse with the `ui-timelapse` skill before anything changes, so the redesign
later has a real "before" on record and every round after it adds a version.

## Phase 1 — Parallel research (cheaper-model subagents, max 3 at once)

Launch up to 3 subagents in one message — Agent tool, `general-purpose`,
`model: "sonnet"` (a cheaper model is plenty for grunt research; never more
than 3 concurrently — rate limits kill spawn bursts):

1. **Ours** — screenshot the feature on OUR app.
2. + 3. **Competitors** — products the user NAMED fill these slots first, one
   agent each. Remaining slots (user named zero or one): a "survey" agent
   that picks the 2-3 competitors with the richest public docs of the
   relevant feature area. User named 3+: give one agent the primary, one
   agent the rest as a batch.

While they run, ground yourself in our codebase on the main thread: the
feature's schema, read/action layer, and pages. Recommendations must map to
real fields ("`project` tag exists, UI never exposes it") — competitor
research without code grounding produces a wishlist nobody can build.

**Subagent briefs — the parts that fail when omitted:**

- **Playwright MCP only, never the Browser pane** — browser-pane screenshots
  cannot be saved to disk and are invisible to the orchestrator. Tell the
  agent explicitly: `mcp__playwright__playwright_screenshot` with
  `savePng: true` + `downloadsDir` set to a per-agent scratchpad subdir
  (`ours/`, `loom/`, `competitors/`), `mkdir -p` first, and report absolute
  paths verified with `ls`.
- **Concurrent agents share one Playwright browser and WILL cross-contaminate
  sessions** (an agent screenshots another agent's page — happened on the
  reference run). Brief every agent: verify each screenshot visually matches
  the URL it just navigated to before keeping it; on a stale/foreign capture,
  close the Playwright browser, reopen, retake.
- **Playwright chromium may be missing** ("Executable doesn't exist …"):
  `npx playwright install chromium` from the MCP's npx cache dir, then
  continue (standing gotcha, survives version bumps).
- **Our app's login**: give the agent the exact recipe — e.g. a dev-only
  login form (email + password on `/login`) with an email that EXISTS AS AN
  ACTIVE USER in the dev database plus the dev login password from the dev
  server's environment. Verify both yourself (read the env value on the dev
  server, query the dev DB for active users) before launching the agent.
  The reference run burned a full agent on `CredentialsSignin` from an email
  that wasn't in the dev DB. Find the app's dev auth path in its AGENTS.md /
  README. Never point agents at prod.
- **Competitor libraries live behind login** — brief agents to use
  help-center articles, marketing/feature pages, and docs (support.loom.com
  etc.), not to attempt signups. Ask for a structured feature inventory
  (organization, discovery/search, sharing, workflow, AI, admin) + which
  features are core/loved vs enterprise-gated + a "distinctive ideas worth
  stealing" list.

## Phase 2 — Synthesize + batched decisions

Compile ONE message for the user:

1. **Current state** — what our feature has and lacks, verified against both
   the screenshots and the code (cite files).
2. **What competitors do** — a few lines per product, only the transferable
   parts.
3. **Recommendations in phases** — cheapest-leverage first: (a) expose what
   the code already supports, (b) small-migration organization features,
   (c) workflow features. Include the user's own seed ideas from the prompt.
   Mark what's deliberately skipped (enterprise-shaped, YAGNI).
4. **Batched multiple-choice decisions**: the 2-4
   forks that change the deliverable, lettered options + a recommendation
   each. Don't drip-feed questions.

Stop and wait for the decisions. Don't start designing an undecided scope.

## Phase 3 — Design canvas of the chosen direction

**REQUIRED SUB-SKILL:** the `design` skill (Claude Design canvas → Artifact).
It owns the canvas mechanics; this phase adds the compare conventions:

- **Current-UI screenshots as their own artboards** ("Current — X") beside
  the redesigned artboards ("Redesign — X"). Downsample screenshots to
  ~70-100 KB JPEGs (`sips -Z 900 -s format jpeg -s formatOptions 60 …`)
  before seeding.
- **Redesign artboards match the app's real design system** — read the token
  files and components first, copy exact values (fonts, colour tokens,
  card radius, button shape).
- **Mark every delta**: dashed outline in the app's accent colour + small "NEW" pill on each
  element that doesn't exist today (label variant "CHANGED" for modified
  ones). Unchanged regions get no decoration — the absence is what makes the
  markers readable.
- **Canvas sticky notes** summarize the deltas per artboard + one overview
  note. Sample data in mockups is fine; say so at handover.
- Static mockups are the default deliverable; only build a clickable
  prototype if the user asked for one.

## Phase 4 (only if the user asks) — Implementation plan

**REQUIRED SUB-SKILL:** superpowers:writing-plans. Ground every task in the
Phase-1 code reading; carry the phased scope and the decisions verbatim; end
with execution-mode options (parallel fan-out / subagent / inline), don't start
building unprompted.

## Gotchas (all bit the reference run)

| Symptom | Fix |
| --- | --- |
| Agent reports screenshots but orchestrator can't see them | Browser pane was used — rebrief: Playwright MCP `savePng` + `downloadsDir` |
| Screenshot shows a different site than the agent navigated to | Shared Playwright session contamination — close browser, reopen, retake, verify visually |
| `CredentialsSignin` on dev login | Email isn't an active user in the dev DB — query the dev DB, use one that is |
| "Executable doesn't exist … chromium" | `npx playwright install chromium` (per-cache-dir, re-run after Playwright bumps) |
| Fan-out returns empty / rate-limited | >3 concurrent agents — waves of ≤3, retry dead legs, report partials loudly |
| Recommendations don't match the code | Phase-1 main-thread code grounding was skipped — do it before synthesizing |
