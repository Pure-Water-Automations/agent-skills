---
name: feature-map
description: Use when an app needs a FEATURE_MAP.md (or one is stale), when a browser-driving/QA agent keeps flailing to find a screen, when triaging a vague bug report or a "???" screenshot against a web app, or when routes, nav, roles or side effects changed in a repo that already has FEATURE_MAP.md. Triggers - "feature map", "map this app", "update the feature map", "agents can't find the page", "where is this screen".
---

# Feature Map

If a LOCAL.md file sits next to this SKILL.md, read it first — it holds this workspace's specifics (paths, tools, examples) and overrides the generic defaults below.

A `FEATURE_MAP.md` at the repo root that takes an agent from a vague report ("the RSVP thing is broken", a screenshot with "???") to **the exact URL, how to log in, what to click, a stable selector, and the source files**, without crawling the repo. Idea from Lauren Tan's Cursor "control glass" verification skill.

**Core rule:** every route, label and selector is quoted from the code. A guess is marked `(unverified)`. An invented selector is worse than no map at all.

## Three modes

| Mode | When | Do |
|---|---|---|
| **Use** | Driving the app or triaging a bug in a repo that has `FEATURE_MAP.md` | Read the header (auth, envs), find the area by the tester's words, read **Access** and **Gotchas** before clicking. Run `scripts/check-drift.sh <repo>` first; if it reports drift, trust the code over the map. |
| **Create** | Repo has no map | Build it (below). Add one pointer line near the top of the repo's `AGENTS.md`: `**Feature map:** see FEATURE_MAP.md — read it before driving the app in a browser or triaging a bug report.` Do not commit unless asked. |
| **Maintain** | You changed routes, nav, roles or side effects, or drift check fails | Edit only the affected area, route-index and danger-index rows in the same change. Re-run `check-drift.sh` until it prints `feature map in sync`. |

## Creating one

1. Read `AGENTS.md`, `.deploy-env.json`, `deploy.sh`, and the auth code. **Never guess the auth. Read it.**
2. Count routes (`find src/app -name page.tsx | wc -l`, or the router file for SPAs). Over ~40 routes: split the areas across **at most 3 helper agents at a time**, each returning finished area sections plus route rows, then stitch them together. At 40 or fewer, do it yourself.
3. Write it in this structure:
   - **Header:** base URLs per environment (dev / prod / local, and which is safe for QA). **How an agent logs in**, per environment: any dev bypass, env var or cookie, a `?email=` param, a PIN, or "Google only, so agents can't log in". Roles and the gates they unlock. How to get seed or demo data.
   - **Danger index:** one table near the top, `| Control (verbatim label) | Page | Effect |`, listing **every** button or toggle that sends email or messages, moves money, writes to an external system, or arms a cron. Agents planning a click-through read this table, not the 50 Gotchas sections. In testing, a with-map agent still missed a send buried in one area's Gotchas.
   - **Global chrome:** nav and sidebar items with their targets, the command palette, global keyboard shortcuts.
   - **One section per feature *area*** (group the routes; don't write one per page), each with:
     - **What / Tester words:** what it does in plain words, plus the labels and synonyms a tester would type.
     - **Reach:** the URL pattern with params, and the click path from the nav.
     - **Sub-features / key actions:** tabs, modals, buttons, empty states.
     - **Selectors:** `data-testid`, `id`, `aria-label`, role and name, or placeholder, quoted verbatim. For a label built in code, quote the template or every value it can take (for example `aria-label="Remove <name>"`, or `"Recognized"` / `"Confirm"`). If none exist, write "none, use visible text".
     - **Gate:** role, module, flag or precondition (for example "needs an event with X").
     - **Source:** page, components, actions or API, and DB models.
     - **Gotchas:** real email, SMS or WhatsApp; money; external APIs; shared or live sheets; native `prompt`/`confirm` dialogs. Mark anything a tester must not click on prod with `⚠️ PROD:`.
   - **Canvas or game apps:** instead of selectors, document how to reach the state (room, map, spawn), the keyboard controls, debug globals and query params, how to simulate a second user, and which server state or log lines to inspect.
   - **Route index table:** `| Route | Area | Source file |` with **every** page. The drift script greps these paths.
   - **Maintaining this map:** say what triggers an update, and give the command to run, `check-drift.sh`.
4. Verify before you finish: `scripts/check-drift.sh <repo>` prints `feature map in sync`, and you spot-check 5 quoted selectors with grep.

## Common mistakes (seen in baseline runs)

| Mistake | Fix |
|---|---|
| No quoted selectors, prose only | Every area gets a **Selectors** line, even if it says "none" |
| No tester words | A vague report can't be matched to an area. List the visible labels and synonyms. |
| Auth described as "sign in with Google" | Say how an **agent** logs in, or state that it can't |
| Guesses presented as fact | Mark them `(unverified)` |
| No drift check | Include a route index with file paths, and the `check-drift.sh` line |
| Side effects only mentioned inside each area's Gotchas | Also collect them into the top **Danger index** |
| Only the routes the nav links to | Unlinked pages (reachable only by URL) are exactly what testers stumble into. Index them and flag them. |

**Bonus:** mapping surfaces real bugs, such as a page gate that doesn't match its action gate, dead buttons, or a dev bypass left on in prod. Report them to the user; don't fix them silently.
