# Stages — which rubric, which questions

The source framework was written for teams with telemetry, A/B traffic, SRE and
counsel. Most small and early-stage apps are not there yet. Scoring a 30-user beta on
"error-budget burn" produces noise. Pick the stage first.

## 1 · Pre-PMF (default for anything under ~100 active users)

**Signals:** no cohort data · Sean Ellis "very disappointed" < 40 % or not yet
run · fewer than ~100 weekly actives · no paying customers or fewer than 10.

**Question:** *Is the team learning fast, honestly, and safely?*

**Rubric:** Tier A (9 dimensions) + gates. See `rubric.md`.

**What replaces the big-company instruments:**

| Framework asks for | Pre-PMF substitute | Source |
|---|---|---|
| Cohort retention | Weekly actives by sign-up week from the existing request log; or a hand-kept list of who came back | HEART, adapted |
| Controlled experiment | Blind side-by-side (a randomized A/B-labelled judging page) or a 5-user observed session per variant | Nielsen: 5 users find ~85 % of problems |
| PMF score | Sean Ellis question, ≥ 30 responses directional, ≥ 100 confident; 40 % threshold | Ellis; Superhuman |
| Satisfaction | SUS (10 questions) — 68 = average, 80+ = users recommend | Sauro & Lewis |
| Interviews | Mom Test rules: past behaviour not hypotheticals; discount compliments; get commitments | Fitzpatrick |
| Segmentation | Superhuman HXC: score only the segment that is "very disappointed", roadmap 50/50 between what fans love and what blocks fence-sitters | Vohra |
| SLO | One health endpoint checked by a scheduled uptime job | SRE, minimum |

**Verdict ceiling:** *Conditional Go* at best until the value event is
instrumented and four weeks of return data exist at the natural cadence.

## 2 · Growth

**Signals:** cohorts exist · > 100 actives · paying customers renewing · Ellis ≥ 40 %.

**Question:** *Does value endure, and can the system sustain it?*

**Rubric:** Tier B (all 23) + gates. Behavioural dimensions must now have
numbers; "unknown" on Retention or Engagement at this stage is itself a
finding scored 1 on Analytics.

## 3 · Idea / spec (no code)

**Question:** *Is this a good hypothesis, and what is the cheapest test?*

Score only:

| Dim | 1 | 3 | 5 |
|---|---|---|---|
| Problem severity | nice-to-have | frequent + painful for a named user | user already pays (time or money) for a workaround |
| User specificity | a category | one persona with a context | an HXC segment you can name people in |
| Alternative clarity | none listed | incl. "do nothing" and the incumbent | why each alternative loses, in the user's words |
| Testability | needs the full build to learn anything | a fake-door, concierge, or prototype test in < 2 weeks | the test is designed, with a pass threshold |
| Viability | no model | payer identified, rough unit economics | comparable priced product exists |
| Feasibility | unknown unknowns | stack known, hardest part prototyped | hardest part already works |

Verdict here is **Build a test / Don't build yet / Kill**, not Go/No-Go.

## 4 · Internal tools

Same stages, but mark Monetization, Pricing, Growth **n-a** with the reason
"internal". Weight Reliability and Engineering higher: the users cannot leave,
so friction compounds silently. Add one dimension: **Adoption by the intended
team** (1: built, unused · 3: most of the team uses it weekly · 5: the old way
is gone).

## 5 · Re-scoring

Re-run after a sprint, a beta round, or before a prod promotion. Same rubric,
same stage unless the signals changed. Report **deltas** beside scores. A
dimension that moved without a matching change in evidence grade is suspect.
Append the row to `docs/SCORECARD.md` in the app repo.
