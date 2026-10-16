---
name: panel-brainstorm
description: Use when the user wants a multi-perspective brainstorm on a feature, app, or product area — "spin up agents with different personalities/job titles", "look at it from different angles", "panel of experts", "come up with 30 ideas and a top 5", "how can we make X more useful", "brainstorm what to do next with X" — especially when they also want to DECIDE on the ideas (implement / hold / reject) rather than just read a list. Also use when they ask to re-run or extend a previous panel, or to "make the ideas decidable like dev-to-prod-promotion-review".
---

# Panel Brainstorm → Interactive Decision Board

If a LOCAL.md file sits next to this SKILL.md, read it first — it holds this workspace's specifics (paths, tools, examples) and overrides the generic defaults below.

Run a persona panel across Codex / Antigravity / Claude credit pools to generate
grounded product ideas, stress-test them with an adversarial CPO pass, synthesize a
deduped ~30-idea list with a wireframed top 5, and publish an **interactive
decision board** (Implement / Hold / Reject per idea) whose copied summary comes
back into chat as the decision of record.

Reference output (a real panel, anonymized):
`assets/decision-board-reference.html`.

## When NOT to use

- A single well-scoped feature request → just build/plan it (or `superpowers:brainstorming` inline).
- Code review or promotion decisions on an existing branch → `dev-to-prod-promotion-review`.
- Pure research questions → `deep-research`.

## Procedure

### 1. Ground yourself first (main thread)

Read the actual code/feature being brainstormed about. Write a 3–6 line
current-state summary (what it does today, key files, known limits). Every
persona prompt embeds this summary plus the concrete file paths to read — this is
what keeps ideas grounded instead of generic.

### 2. Design the panel

5–7 personas, each with a **name, job title, and a lens that produces different
ideas** — not different wordings of the same lens. The proven mix:

| Persona archetype | Lens | Good backend |
|---|---|---|
| Staff engineer ("Dex") | cheap & high-leverage given existing code | codex |
| Growth PM ("Priya") | activation, habit loops, measurement | codex |
| UX designer ("Wren") | lost users, wayfinding, accessibility | antigravity (≤1 leg) |
| Power-user operator ("Marisol") | the busy operator's actual day | claude |
| Nervous newcomer ("Jomar") | day-3 confusion, reassurance, language | claude |
| AI strategist ("Kade") | agentic frontier, mapped onto existing machinery, risks | claude |

Swap archetypes to fit the subject (e.g. a client persona, a bookkeeper). Keep at
least one *user* persona (not a builder) and one *skeptic-adjacent* lens.

Each persona task: "BRAINSTORM TASK (write a markdown doc, do NOT change app
code)… propose exactly 8 ideas… for each: short name, one-line pitch, why/moment
it serves, how it would work (grounded in the files you read), effort S/M/L.
Write to `docs/<topic>-ideas/<persona>.md`. That file is your ONLY deliverable."

### 3. Run it as a parallel fan-out

Use whatever parallel runner you have: a multi-backend fan-out tool that runs each
persona as an independent background job in its own git worktree (Codex /
Antigravity / Claude), or native background subagents (max 3 concurrent, waves
if more). Additions specific to panels:

- An **adversarial review pass** (a final job that reads every persona doc) with a
  **product-panel focus**, not a code review:
  "You are a skeptical Chief Product Officer chairing a product panel… critique
  each panelist's ideas for realism and impact, call out overlaps, end with your
  ranked top 8." The CPO verdicts become per-idea annotations later.
- Run in background; monitor for completion.

### 4. Verify deliverables — backends can lie

After the run, **check every persona's output file actually exists** (`ls` the
worktrees). Antigravity can report `status: done` having written nothing. Re-run
any missing persona as a native background subagent (same prompt, "return the
ideas as your final message, do not write files") — takes ~1 minute.

Also: the review's final ranked list can be truncated in the runner's
report files. The per-idea critiques usually survive; do the final ranking
yourself.

### 5. Synthesize

- Dedupe ~48 raw → ~30 ideas grouped into 5–6 themes; keep persona attribution
  (convergence = multiple personas proposing the same thing is the strongest
  ranking signal).
- Pick a top 5 by: convergence → CPO verdict → fit with existing code.
- Note what the panel **cut** and why (one line) — the user wants to see the kills.
- Persona docs live in the runner's worktrees that get cleaned up; if worth
  keeping, copy them out before running any cleanup.

### 6. Build the interactive decision board (Artifact)

Adapt `assets/decision-board-reference.html` — keep its CSS kit and the entire
`<script>` verbatim except `STORE_KEY` (must be unique per board or two boards
clobber each other's decisions). Load the `artifact-design` skill before writing.

Required elements (the dev-to-prod-promotion-review pattern):

- **Sticky live tally** — implement / hold / reject / undecided counts.
- **Top-5 cards** with a CSS-only **wireframe** of the change (the reference has a
  reusable wireframe kit: `.wf`, `.frame`, `.side`, `.bub`, `.rankrow`, `.spot`,
  `.note`) + persona attribution + a `CPO check:` callout.
- **3-way toggle** (`✓ Implement / ◦ Hold / ✕ Reject`) on every top-5 card AND
  every row of the 30-idea table. Decisions live at **leaf-idea granularity**:
  a bundle card sets `data-key` plus `data-also="iX,iY"` so deciding the card
  decides its constituent ideas, and the table rows stay individually adjustable.
  Clicking the active choice again clears it.
- **localStorage persistence** keyed by the unique `STORE_KEY`.
- **Decision summary textarea + Copy button** — Artifacts have no `sendPrompt`
  bridge; the copied text pasted back into chat IS the return channel. Include a
  Reset button.

Verify before publishing: serve the file over a local `python3 -m http.server`
(the browser pane's `file://` preview is flaky) and click-test with
`javascript_tool`: bundle click sets constituents, tally updates, localStorage
persists, reset clears. Mojibake in the local preview is just the missing charset
header — the published Artifact sets one.

Publish with the Artifact tool; republish the same file path to keep the URL.

### 7. Report and collect decisions

Final chat message: top 5 in one line each + artifact link + note that decisions
copy back into chat. When the user pastes the summary back, treat it as the
decision of record: honestly reconcile it against your own ranking (a surprise
reject is signal, not noise), then plan/execute the IMPLEMENT list and park HOLD
items where they say.

## Common mistakes

| Mistake | Fix |
|---|---|
| Personas without file paths to read | Generic ideas — always embed current-state summary + paths |
| Trusting agy's `done` status | Check the output file exists; re-run leg as native subagent |
| Decisions at bundle granularity only | Leaf ideas decide; bundles fan out via `data-also` |
| Reusing a `STORE_KEY` | Two boards overwrite each other's localStorage decisions |
| Cleaning worktrees before copying persona docs | Docs are on worktree branches — copy out first if keeping |
| Skipping the CPO pass | Unranked wish-list; the critiques are half the value |
| Waiting for the CPO's ranked list | It truncates; rank yourself from convergence + verdicts |
