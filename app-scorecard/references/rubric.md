# App Scorecard — Rubric

Same anchors every run. Score the anchor the app **provably** meets, not the
one it aspires to. Evidence grade beside every score.

## Scale

| Score | Anchor |
|---|---|
| **0** | Missing, broken, or actively harmful |
| **1** | Exists as intent or assertion only; major unresolved risk |
| **2** | Plausible but incomplete; weak or inconsistent evidence |
| **3** | Competent baseline; the important requirements are met |
| **4** | Strong and instrumented; evidence shows above-baseline performance |
| **5** | Exceptional: differentiated, validated, resilient, improving |
| **U** | Unknown — cannot be established from available evidence (behavioural dimensions without telemetry) |
| **n-a** | Genuinely not applicable (record why) |

## Evidence grades

| Grade | Meaning |
|---|---|
| **E0** | Assertion. "Pastors will want this." |
| **E1** | Qualitative. Repeated interviews / form responses describe the same thing. |
| **E2** | Behavioural. Users demonstrably do it in a beta / prototype without prompting. |
| **E3** | Causal / live. Production cohorts or a controlled experiment. |
| **E4** | Durable. Persists across cohorts, segments, time, economics. |
| **O** | Observed directly in code, config, deploy, or logs (for engineering dimensions). |

---

## Gates (noncompensatory — check first, list first)

A gate is **open** (failing), **closed** (passing), or **n-a**. Any open gate
caps the verdict at *Iterate*.

| Gate | Open when | Evidence to look for |
|---|---|---|
| **G1 Privacy & legal** | App collects PII (email, name, usage) with no privacy policy, no terms, or no way for a user to delete their data. Payments taken without posted terms. | Routes named privacy/terms; a deletion route; Stripe/checkout present; store writes keyed by email. |
| **G2 Authorization** | Any gated capability enforced only client-side; secrets in repo; payment webhook unverified. | grep `status: 401/403` in API; webhook signature check; `git ls-files` for `.env`. |
| **G3 Accessibility floor** | Core journey unusable by keyboard or screen reader; animations with no `prefers-reduced-motion`; contrast below WCAG AA on primary text. Weight up when the audience skews older or low-vision. | axe pass on 3 core pages; grep reduced-motion, focus-visible, aria, alt. |
| **G4 Content correctness** *(reference, AI, scripture, medical, legal, financial apps)* | The product asserts facts it cannot back: misattributed quotes, uncited AI answers, hallucinated numbers, stale reference data presented as current. | Attribution logic, citation completeness, grounding guard, corpus provenance, a sample of 20 outputs checked by hand. Target: **faithfulness ≥ 0.95, zero misattributions in the sample** (see research-notes §RAG). |
| **G5 Data safety** | User-generated or paid-for data can be lost: no backup before deploy, no store durability, destructive actions irreversible. | Deploy script backup step; store type; undo/confirm on deletes. |

---

## Tier A — Pre-PMF rubric (9 dimensions)

Use when < ~100 actives, no cohort data, or Ellis score < 40 %. Adapted from
Marty Cagan's four risks (value, usability, feasibility, viability) plus the
framework's trust gates. The question at this stage is **"is the team
learning fast, honestly, and safely?"**

### A1 Problem & user clarity
- 1: user is "everyone" or a category; job not stated.
- 3: one named user, one job, cadence named, alternatives listed incl. "do nothing".
- 5: high-expectation-customer segment identified (Superhuman method); non-goals written.
- Checklist: user named · job named · cadence named · alternatives · non-goals · first-value event defined.

### A2 Value evidence
- 1: team belief only (E0).
- 2: compliments from friendly testers ("great job!") — Mom Test says discount these.
- 3: ≥ 5 users independently describe the same pain, or ≥ 30 Ellis responses with "very disappointed" 20–40 %.
- 4: Ellis ≥ 40 % on ≥ 30 responses, or repeat unprompted use observed (E2).
- 5: Ellis ≥ 40 % on ≥ 100 responses and paying users renew.
- Checklist: Ellis survey run · sample size · segment split · past-behaviour questions asked (not hypotheticals) · commitments obtained (time, money, intro).

### A3 First-value & onboarding
- 1: sign-up before any value; tutorial required.
- 3: core action available before account; nonessential content deferred; permissions in context.
- 5: median time-to-value measured and under one minute for the core job.
- Checklist: value before sign-in · clutter off the entry screen · in-context permission asks · recoverable setup errors · time-to-value measurable.

### A4 UX design (see §UX Design sub-rubric below for anchors)

### A5 Content / output correctness *(if G4 applies; else n-a)*
- 1: no attribution or grounding logic.
- 3: attribution guard with tests; citations shown; a manual sample of 20 outputs has ≤ 1 defect.
- 5: automated faithfulness eval (RAGAS-style) in CI, ≥ 0.95, zero misattribution in a 50-sample audit, user-facing "report this" loop.

### A6 Measurement
- 0: analytics import that never fires (wrong platform) — counts as nothing.
- 1: server logs of requests only.
- 3: first-value event instrumented; weekly actives by sign-up week computable.
- 5: North Star + 3 input metrics + guardrails on a dashboard the owner reads weekly.
- Checklist: value event fires · activation ≠ registration · cohort query exists · vanity metrics labelled · event names stable.

### A7 Engineering hygiene
- 1: no tests, no CI, manual deploy, secrets in repo.
- 3: tests run and pass; lint runs; CI to dev; dev/prod separated; secrets out of repo; lean deps.
- 5: prod CI with rollback; DORA metrics known; observability on core flows.
- Checklist: `npm test` green · lint runs · CI · dev/prod isolation · rollback documented · dependency count justified · health endpoint.

### A8 Reliability floor
- 1: single box, no fallback, no health check, no backup.
- 3: graceful degradation on each external dependency (AI, embeddings, email); error boundaries; store backup before deploy.
- 5: SLI/SLO for the core journey; uptime alerting; error budget policy.

### A9 Trust & safety (roll-up of gates G1–G3, G5)
- Score = 0 if any gate open; 3 if all closed; 5 if additionally a written threat model, retention policy, and an accessibility audit date.

---

## Tier B — Growth rubric (23 dimensions)

All of Tier A plus the following. Anchors condensed; full definitions,
pitfalls, and metrics in `framework-source.md §Dimension matrix`.

### Strategy & economics
| Dim | 1 | 3 | 5 |
|---|---|---|---|
| **B1 Product strategy** | roadmap of unrelated features | focused wedge, explicit trade-offs, non-goals | durable advantage articulated and defended in decisions |
| **B2 Value proposition** | feature list | maps to a job, pains, gains | differentiation is outcome-based and users repeat it back |
| **B3 Market fit** | assertion | Ellis ≥ 40 % or repeat-use cohorts | retention + renewal + organic pull across segments |
| **B4 User research** | none | channels exist, studies logged | research demonstrably changed decisions |
| **B5 Analytics / KPIs** | counts | North Star + activation + retention + guardrails | data-quality checks, experiments read from same taxonomy |
| **B6 Experimentation** | none | hypotheses written before results; randomization correct | power/MDE, guardrails, long-term read |
| **B7 Growth loops** | share button | loop diagrammed, receiver gets value | loop measured invite→activation, organic users retain |
| **B8 Monetization** | none / paywalls the aha | payer identified, webhook verified, core value free | conversion, churn, NRR, margin monitored |
| **B9 Pricing** | arbitrary | unit understandable, tiers match code | willingness-to-pay tested, expansion path |

### Experience & trust
| Dim | 1 | 3 | 5 |
|---|---|---|---|
| **B10 Onboarding** | see A3 | | |
| **B11 Retention** | U | cohort at natural cadence computed | retention improving across cohorts; resurrection understood |
| **B12 Engagement** | U | "meaningful action" defined and counted | depth/breadth tracked; satisfaction guardrail |
| **B13 Core UX patterns** | inconsistent nav, missing states | Nielsen heuristics pass; empty/loading/error/offline states | task success measured; abandonment tracked |
| **B14 Interaction design** | invisible state, tiny targets | feedback on every action; Fitts/Hick respected; reduced-motion | mis-tap / input-error rates measured |
| **B15 UX design** | see §UX Design | | |
| **B16 Accessibility** | gate open | WCAG 2.2 AA on core journeys, axe clean, keyboard pass | screen-reader test with a real user; audit dated |
| **B17 Security / privacy** | gate open | ASVS L1; server-side authz; retention policy; deps scanned | threat model; pen test; privacy requests fulfilled |
| **B18 Legal / compliance** | gate open | privacy, terms, deletion; corpus/content licences documented | counsel reviewed; store disclosures match SDK behaviour |

### Engineering & scale
| Dim | 1 | 3 | 5 |
|---|---|---|---|
| **B19 Performance** | untested | CWV good at p75 (LCP < 2.5 s, INP < 200 ms, CLS < 0.1); heavy data server-side | budgets enforced in CI; tested on low-end device / slow network |
| **B20 Reliability** | see A8 | | |
| **B21 Engineering practices** | see A7 | | |
| **B22 Scalability** | unplanned | 10× scenario written; hotspots named | capacity headroom known; cost per value-unit tracked |
| **B23 Localization** | hard-coded strings | strings externalized; target locales present | plural/date/number rules; layout tested per locale; localized task success measured |
| **B24 Design system** | ad-hoc styles | tokens + components used consistently | visual regression; governance; accessibility built into primitives |

---

## §UX Design sub-rubric (A4 / B15)

Visual and interaction quality as a *user* experiences it. Score each row 0–5,
report the **lowest** as the dimension score (weakest link), list the others.

| Row | 1 | 3 | 5 | How to check |
|---|---|---|---|---|
| **Hierarchy** | everything same weight; user cannot find the primary action | one obvious primary action per screen; secondary actions visibly secondary | eye lands on the right thing in < 1 s in a 5-second test | Squint test on 3 core screens; count competing CTAs |
| **Typography** | > 3 faces or sizes without a scale; body < 15 px on mobile; lines > 90 ch | one scale, ≤ 2 families, body 16–18 px, 45–75 ch measure, headings balanced | type carries the brand; tabular numerals where digits align | Inspect computed styles on body + h1–h3 |
| **Colour & contrast** | fails AA on primary text; colour is the only state signal | AA everywhere; semantic colours separate from brand accent; dark mode legible | AAA on body text; palette chosen, not defaulted | axe contrast; toggle dark mode |
| **Spacing & layout** | collapsed margins, misaligned cards, horizontal scroll on mobile | consistent spacing scale; grid/flex with gap; responsive at 375 / 768 / 1280 | rhythm holds across every screen | Resize; look for uneven gutters |
| **Consistency** | same action styled 3 ways | components reused; same thing looks the same everywhere (Jakob's law) | design system with tokens | Count button variants |
| **Copy** | jargon, system-speak, unclear errors | user's language; buttons say what happens; errors say how to fix | copy tested with a target user | Read every label aloud as the target user |
| **Feedback & state** | actions with no acknowledgement; no loading/empty/error states | every action acknowledged; all four states present | optimistic UI where safe; undo on destructive | Click everything once |
| **Motion** | animation cannot be disabled | `prefers-reduced-motion` respected; motion under 300 ms; nothing auto-plays | motion communicates state, never decorates | grep + OS setting test |

Severity for individual findings: **Nielsen 0–4** (0 not a problem · 1 cosmetic
· 2 minor · 3 major · 4 catastrophe — must fix before release). Report only
≥ 2 in the scorecard; put 1s in an appendix.

---

## Smallest-fix discipline

For every dimension scored ≤ 3, one line: reversible, hours-to-days, names the
file or route. Examples from the first run:

- Analytics 1 → "Replace the dead Vercel import with self-hosted Umami; fire one event: quote copied."
- Accessibility 2 → "One `@media (prefers-reduced-motion: reduce)` block; axe on Search, Ask, Today."
- Legal 1 → "Privacy + terms pages and a `/api/auth/delete` route this week."
- Core UX 3 → "Add `app/error.tsx` and `app/not-found.tsx`."

If the smallest fix is bigger than a week, the dimension is not a fix, it is a
project — say so and route it to `panel-brainstorm` or a plan.
