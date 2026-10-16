---
name: check-open-source
description: Use before writing an implementation plan, scaffold, or first code for any new library, tool, service, parser, integration, or app feature with a recognizable domain (e.g. "parse .ics", "OAuth device flow", "kanban board", "PDF OCR"). Also use when the user says "check open source", "check prior art", "is there an open source version", "don't reinvent this", "what already exists for X", or "baseline check". Not for bug fixes or edits inside an existing codebase.
---

# Prior Art & Baseline Check

If a LOCAL.md file sits next to this SKILL.md, read it first — it holds this workspace's specifics (paths, tools, examples) and overrides the generic defaults below.

Before planning or scaffolding anything greenfield, find what already exists and decide the baseline **with the user** — adopt a repo, fork it, borrow its patterns, or build fresh. Checking npm for one helper dependency is NOT this skill; the question is whether the *whole thing* already exists.

## Steps

1. **Search (2–3 queries, 5 min cap).** Cover GitHub, the package registry for the stack, and awesome-lists.
   ```bash
   gh search repos "<domain keywords>" --sort stars --limit 8 --json fullName,stargazersCount,pushedAt,license,description
   npm search <keywords>            # or: pip index versions / pypi search via WebSearch
   ```
   Plus one `WebSearch`/`brave_web_search` for `awesome <domain> github` and `<domain> open source alternative`.
   If `gh` errors (auth/env), `npm view <pkg> license time.modified` + WebSearch is enough — don't stall on tooling.
2. **Shortlist 1–3 repos.** For each: `gh repo view <owner/name> --json licenseInfo,stargazersCount,pushedAt,openIssues,description`. Skim README + top-level layout (`gh api repos/<o>/<n>/contents`).
3. **Triage summary** (chat, this shape, no essay):
   | Repo | License | Health (stars · last commit · open issues) | Value surface |
   |---|---|---|---|
   Value surface = exact components worth taking: schemas, parser, auth handling, migrations, test fixtures, UI components.
4. **Recommendation** — one of, marked with reason in one line each:
   - **Adopt** — use it as a dependency / deploy it as-is.
   - **Fork** — it's 80% there; license permits; we own the diff.
   - **Reference patterns** — read it, steal the design, write our own.
   - **Build greenfield** — nothing close, or licenses (GPL/AGPL/SSPL/none) block use in a shippable app.
5. **STOP. Ask the user** via `AskUserQuestion` with those options (recommended first). Do not write plan or code until they pick.

## Hard rules

- No license = not usable. GPL/AGPL = flag loudly if the app may ship publicly.
- Dead repo (>18 months idle, unanswered issues) downgrades Adopt to Fork or Reference.
- Nothing found after the cap → say so in one line, recommend Greenfield, still ask.
- Output stays short: table + recommendation + question. Heavy README quotes stay out.

## Red flags — you are skipping this skill

- "I'll just check npm for the hard part" (that's a dependency check, not a baseline check)
- "It's simple enough to write" — search first; simple domains are the most over-solved
- Planning file layout before the triage table exists
