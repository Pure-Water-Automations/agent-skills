---
name: qa-sweep
description: >-
  Pre-human-testing QA sweep of a web app driven by browser-automation. Reads a
  testing checklist source (a Notion testing DB, or an explicit page list), logs
  into the app once, then sweeps each page/flow as a real user would — recording
  PASS / FAIL / BLOCKED per step, AND surfacing quality-of-life (QOL) improvement
  ideas. ADAPTIVE: auto-picks how to run — solo on the main thread (cheapest),
  or a PERSISTENT pool of ≤3 browser-tester subagents that stay alive across
  pages (no cold context reload per page) — based on page count, complexity, and
  how much room this session's context has left. Also runs a STRESS pass — the
  mechanical half of "try to break it" (empty submits, double-clicks, odd
  characters, URL tampering, narrow viewport) with the console and network log
  open, catching silent 500s a human tester cannot see. Use whenever the user says
  "run a QA sweep", "test everything before the tester", "catch blockers before
  human testing", "smoke-test all the pages", "try to break <app>", or wants a
  pre-flight pass over an app's testing pages.
works-in: Claude
never-auto-send: true
---

# QA Sweep — pre-human-testing pass

If a LOCAL.md file sits next to this SKILL.md, read it first — it holds this workspace's specifics (paths, tools, examples) and overrides the generic defaults below.

Sweep an app's testing checklist to catch blockers **before** a human tester hits
them, and collect QOL improvement ideas. Read-only-ish: click through flows, may
create obviously-test data (a test contact, a test expense), but never delete real
data, never send real email/messages, never complete real payments, never touch prod.

## When to use / not use

- **Use:** a dev/staging app with a set of testing pages (or a Notion testing DB), ahead of a human testing round.
- **Don't use:** production (never), or a single quick "does page X work" check (just navigate there directly).

## Inputs

- **App base URL** (must be a dev/staging host — refuse anything that looks like prod — the app's public production domain(s)).
- **Checklist source** — either a Notion testing data-source ID (each row = one page/flow with `🧪 Testing instructions`), or an explicit list of routes.
- **Auth**: how to sign in (see below).

## Phase 0 — Auth once, in the shared browser session

Subagents inherit the same browser session, so log in **once** on the main thread first:

1. `mcp__Claude_Browser__preview_start` with the app URL.
2. Auth by gate type — tell which by navigating: a **Cloudflare Access** OTP page = CF Access; the app's **own "Sign in with Google"** = app-level OAuth:
   - **Cloudflare Access:** if the user's Access policy allows One-time PIN, enter the user's own email, read the OTP **or magic-link** from their mailbox (a Gmail MCP search for `from:cloudflareaccess.com newer_than:5m` → read the message), navigate the magic-link URL directly — fastest, fully headless. Only works when that email is in the Access group for the app.
   - **Google OAuth WITH a dev-login form (headless — check for this FIRST):** some app-OAuth apps expose a dev-only credentials login — a "Dev login (non-production)" email+password form on `/login`, gated by an env flag (e.g. `DEV_LOGIN_ENABLED`) on the dev server. This IS headless: read the app's dev-login password from the dev server's environment, navigate `/login`, fill the form with an email that is an active user in the dev DB (ideally an admin) + that password. Roles resolve as normal.
   - **Google OAuth with NO dev-login form:** you CANNOT complete this headless (the user's Google password is a hard safety rule, plus 2FA). Ask the user to click through the login in the Browser pane themselves, then continue once they confirm. Note in the report that any screens behind Google OAuth were reachable only because they logged in live.
3. Confirm you land on the app (`get_page_text` shows app content, not the login page). The session cookie is now shared with every subagent.

## Phase 0.5 — Pick the execution mode (ADAPTIVE — do this before touching pages)

After Phase 1 builds the work list, choose HOW to run it. Three modes, decided by three
signals: **N** = pages in the list, **C** = how many are complex multi-step flows, and
**context room** = whether THIS session is already long / has been compacted / is near its
window (if so, heavy `read_page`/screenshot churn on the main thread risks a compaction).

| Situation | Mode | Why |
|---|---|---|
| `N ≤ 4` and `C ≤ 1` and context has room | **Solo** — run every page yourself on the main thread | Cheapest (~20K/page vs ~100K cold agent), and screenshots render INLINE where the user can see them (see Phase 3). No spawn overhead. |
| `N ≥ 5`, or `C ≥ 2` | **Persistent pool** — a fixed pool of ≤3 browser-tester subagents (Phase 2) | Parallelism + one cold-start per agent instead of per page. |
| Context is already large / compacted, **regardless of N** | **Persistent pool** | Offloads read_page churn out of *your* context; buys context hygiene even when solo would be fewer raw tokens. State this reason when you pick it. |

Hybrid is the norm: even in pool mode, do the **simple render-and-basic-action pages
yourself** on the main thread and only send **complex flows** to the pool. And **always**
capture the user-facing proof/QOL screenshots on the main thread (Phase 3) — never rely on
a subagent for anything the user needs to SEE.

Say which mode you picked and why in one line before proceeding.

## Phase 1 — Build the work list

If given a Notion testing DB: `mcp__notion__notion_query_data_source` on it, keep rows whose Status is **Ready for testing / In testing / Issues found** (skip **Not ready**). For each, note the page_id (for the instructions) and map it to a route.

**Classify each item** simple vs complex — this feeds Phase 0.5 and Phase 2:
- **Complex** = create/confirm/multi-tab flows, anything with several steps, or a page previously marked "Issues found" you're re-verifying (Messaging, Finance, Pipelines, a review console, a wizard).
- **Simple** = render-and-basic-action (a list, a settings page, a static view). Do these on the main thread even in pool mode.

## Phase 2 — Persistent 3-agent pool (when Phase 0.5 says pool)

The lesson from an early run: six FRESH agents each paid a ~80–116K
**cold start** (system prompt + browser tools + instructions reloaded from scratch). A
persistent pool pays that once per agent, then reuses the agent's live tab + context for
each subsequent page (~20–40K each). Same ≤3-concurrent cap, far cheaper.

**Mechanics:**
1. Spin up **≤3** persistent testers (`Agent`, `model: haiku`, `subagent_type: general-purpose`, `run_in_background: true`). Keep each returned `agentId`.
2. First prompt to each = the shared preamble (below) + its **first** page's steps.
3. As pages remain, **`SendMessage`** the next page's steps to whichever agent is free (round-robin). The agent REUSES its own tab + accumulated context — no cold reload. This is the whole point of the pool: never re-send the preamble, just the new page.
4. **Recycle to cap context growth:** a persistent agent's context grows with each page (it accumulates `read_page` dumps). After an agent has handled **~4 pages**, let it finish and spawn a fresh replacement for the remaining work — otherwise a long-lived agent balloons and its per-page cost creeps back toward cold-start.
5. Never exceed **3** agents driving the shared browser at once (tab cross-talk degrades `read_page`). Never bulk-close tabs while any agent is still running.

**Shared preamble (first message to each pool agent):**
- App URL + "you are ALREADY authenticated in the shared browser session, navigate directly."
- "First call `mcp__Claude_Browser__tabs_create` for your OWN tab; use only that tabId; never touch other tabs. Reuse this same tab for every page I send you."
- Safety rails: no deletes of real data, no real sends, no real payments, no prod, no final irreversible decisions.
- The reporting contract (Phase 3): PASS/FAIL/BLOCKED per step **+ QOL ideas as TEXT** (not screenshots — see Phase 3).
- The exact test steps for its first page (paste them — fetch the `🧪 Testing instructions` yourself and inline them; don't make the agent rediscover).

## Phase 3 — Screenshots + QOL ideas (the honest version)

**Hard constraint (learned the hard way):** `mcp__Claude_Browser__computer` action `screenshot`
returns the image **inline in the caller's transcript only**. There is NO save-to-path
option, and a **subagent's** screenshot is never returned to the orchestrator or to the user —
it is effectively invisible, and the "save PNG to the run dir" idea does NOT work (the run
dir stays empty). So:

- **Subagents report QOL ideas as TEXT only:** `{page, element, idea (one line), why it helps, effort S/M/L}`. No screenshots from subagents — they can't be seen.
- **The MAIN THREAD captures every screenshot the user needs to see** — proof-of-fix and the top 1–3 QOL ideas. Screenshots taken on the main thread render **inline in your reply**, which is the only place the user can actually view them. For a QOL annotation:
  1. Navigate to the screen.
  2. Paste `references/annotate.js` via `mcp__Claude_Browser__javascript_tool` and call `annotate({selectorOrRect, label})` — draws a highlight box + callout INTO the DOM so it lines up with the real UI.
  3. `mcp__Claude_Browser__computer` action `screenshot` → renders inline.
- **Viewer caveat — state it once in the report:** inline images need an image-rendering client (Claude Code desktop / VS Code / web app). In a bare terminal they don't render and there is **no file fallback** — the browser pane cannot export screenshots to disk. If the user needs openable image files, flag it: that needs a different capture path not available via the browser pane today.

Keep QOL honest — only real, specific ideas. Two strong ideas beat ten vague ones.

## Phase 3.5 — Stress pass (the mechanical half of "try to break it")

Human testers now get a **Try to break it** section in every test guide. Do the half a
machine does better, so the human's time goes on the half that needs judgement.

**Your actual advantage here is the console.** A human double-clicks Save, sees one task,
and moves on. You double-click Save, see one task, *and* see the second request 500 in the
network log. Keep `read_console_messages` and `read_network_requests` open through this
whole phase — a silent server error during misuse is the highest-value thing this sweep can
find, and it is invisible to the person who runs the guide next week.

Run these against the main create/edit flow of each page (not every field — one representative
form per page):

- **Empty submit** — submit with nothing filled in. Expect a clear validation message, not a 500 and not a silent no-op.
- **Far too much** — a 200-character title; several pages of text pasted into a one-line field. Expect truncation or refusal, not a crash.
- **Odd characters** — emoji, curly quotes, accented letters, another alphabet, and a string that *looks* like code (`<b>x</b>`, `{{7*7}}`). It must come back out as literal text. If it renders as markup or the braces evaluate, that is a real finding — report it as a bug, do not go further.
- **Double submit** — click the primary button twice fast. Then check the list: **two records is a bug**, and the network log tells you whether the second request was sent or blocked client-side.
- **Nonsense values** — a date in 1900 and 2099; an end before its start; a negative number.
- **URL tampering** — hand-edit the address to (a) a record id that does not exist, and (b) a record belonging to another org/user if the seed data has one. Expect a clean not-found or not-authorised page. A crash is a bug; **being shown the record is a security finding — stop and report it immediately, do not keep poking.**
- **Refresh mid-save** — trigger a save and reload during it. Check nothing is left half-written.
- **Two tabs** — `tabs_create`, open the same record twice, edit both, save both. Anything with a version column or optimistic lock belongs here.
- **Narrow viewport** — `resize_window` preset `mobile`, reload, re-walk the page's main action. Overlapping, clipped or unclickable controls are findings.

**Cleanup is not optional.** This phase creates junk by design. Name everything you create
with a stable marker (`"QA stress — delete me"`) and delete it at the end of the phase, the
same discipline as the seed-script `--clean` rule above. Never leave stress data on a shared
dev box, and never run any of this against prod.

**Two things to hold back on:** anything destructive to data you did not create, and anything
that sends (invites, emails, messages) — the sandbox usually cannot send, but do not rely on
that being true on every box.

Everything found here goes through **Phase 4** like any other finding — stress runs are the
richest source of false positives, because a "crash" after several navigations is usually the
degraded-browser artifact, not the app.

## Phase 4 — Verify surprising findings YOURSELF before trusting them

Two failure modes produce false-positive "bugs." Rule out BOTH before reporting any FAIL:

1. **Degraded browser:** a tab that has navigated several times starts returning `read_page` → empty / `Viewport: 0x0`, and clicks silently no-op — reads exactly like "the button is broken." (Four "critical nav bugs" in the source run were all this.) Re-check on a **fresh tab** (`tabs_create` → `navigate` → `get_page_text`); `get_page_text` + direct URL nav stay reliable when `read_page` has gone stale.
2. **Working-as-designed / spec mismatch:** a cheap agent flags "missing feature" when the feature is data-gated (a badge that only shows for a candidate/deal that isn't in the test data), threshold-gated (a stale badge that only appears after 30 days), or the agent's test spec guessed the wrong values. Before reporting, **check the code** (grep the component) — cheaper than a browser recheck and definitive. In one early run, ALL of: age-badge, price-autofill, dup-flag, and a preset-param "bug" were this. If the feature is real but the data to exercise it is absent, that's **BLOCKED (no demo data)** or a reason to **seed** (below), not a FAIL.

Only findings that survive the relevant recheck go in the report as real.

### Optional — seed demo data to un-BLOCK a visual path

If a real feature is BLOCKED only because the dev DB has no row to show it (empty client
list, no trial candidate), and the user wants it click-verified: write a small self-contained
seed script with a `--clean` mode (stable marker like `"… — delete me"` / a fixed email so
cleanup is a deterministic delete), run it on the box (`scp` + `npx tsx` sourcing the
service's `EnvironmentFile`), verify on the main thread (inline screenshots), then **run
`--clean`**. Never leave seeded data on a shared dev box.

## Phase 5 — Report

Produce a single summary:
- **Blockers** (real, verified FAILs) — most severe first, with repro + evidence.
- **Per-page status table** — PASS / FAIL / BLOCKED / not-testable-headless (file-upload; real Google-OAuth screens **only on apps with no dev-login form** — with one, the authed console IS testable headless).
- **QOL ideas** — grouped by page (text), with the top 1–3 as inline main-thread screenshots.
- **Stress findings** — what you broke and how, separated into *reachable by accident* (a slow network, an impatient click, two tabs open) and *only reachable on purpose*. Say plainly which stress checks you ran and which you could not, so the human guide can pick up the remainder rather than assume it is covered. Any console or network error seen during the stress pass belongs here even if the UI looked fine.
- **False positives ruled out** — degraded-browser artifacts AND working-as-designed/spec-mismatch, so the reader knows what was checked and dismissed.
- **Execution mode used + cost** (below).

Optionally, on request, write findings back to the Notion testing rows (Result notes / a `💡 QOL ideas` child page). Writing to Notion or messaging any tester is **draft-then-confirm** — never auto-post to a person.

## Cost planning

- **Cold subagent** ≈ ~100K for its first page (reloads system prompt + browser tools).
- **Persistent pool, each additional page** ≈ ~20–40K (no reload; only the incremental page churn). This is the pool's whole advantage — an N-page pool run ≈ `3×100K + (N−3)×~30K`, vs fresh-per-page `N×100K`.
- **Solo main-thread** ≈ ~20K/page, but every page accumulates in YOUR context (watch compaction — that's when to switch to pool even if solo is fewer raw tokens).
- Rule of thumb: a 6-page run is ~120–150K solo vs ~595K fresh-agents (an early mistake) vs ~360K persistent-pool. Pick per Phase 0.5.
- Report the actual total at the end (sum subagent tokens from completion notices + note main-thread is additional/estimated).
