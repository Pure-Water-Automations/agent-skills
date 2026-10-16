# Builder brief template (one round)

```
Repo: <app> (<stack in one line>; read AGENTS.md and docs/<REF>_PARITY.md fully first, esp. "Round <N>").
You are implementing ROUND <N> of making <app> work like <reference>: <ids, e.g. E1 Pen, E2 Sticky stack>.
[Parallel round only:] Another worker is changing <files> at the same time — do NOT edit those.

<For each id: the observed reference behaviour in concrete terms (sizes, defaults, menu items verbatim,
what happens after the action) + what to build in OUR app, in our words.>

Rules:
- Every edit goes through the existing history (undo/redo) and live sync exactly like existing edits;
  one user action = one undo step. Viewers can't edit.
- Backward-compatible data; sanitize everything new on the server (lengths, enums, URLs, colours).
- Mobile: works at 390 px with the app's existing touch patterns.
- No new dependencies; keep diffs focused; match code style.
- Tests for the pure logic of every item (node:test or the repo's runner).
- Verify: typecheck, full tests (scratch DB: createdb … && migrate deploy … && dropdb …), production build
  in YOUR worktree only. All must pass. Run the app from your worktree on a spare port, try each item in
  headless Chrome at 1440 and 390, look at screenshots, fix what's off.
- Append a "Round <N>" status note (built / not done / differences) to docs/<REF>_PARITY.md.
- Commit with a message ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do not push,
  merge or deploy.
- Final report: what you built per item, files changed, test results, anything skipped or unsure.
```
