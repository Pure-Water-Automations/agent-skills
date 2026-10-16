# Research notes — what fills the gaps in the source framework

The source report (`framework-source.md`) is strong on gates, evidence grades,
and refusing to infer behaviour from code. It is weak on: small products,
content correctness, a concrete UI/UX rubric, and inline traceability. These
notes fill those gaps. Numbers below are the **only** external thresholds the
skill is allowed to cite.

## Product-market fit at small scale

- **Sean Ellis question** — "How would you feel if you could no longer use
  [product]?" Percentage answering *very disappointed* is the PMF score.
  **≥ 40 %** correlates with products that scaled; below it, growth stalls.
  **30 responses** directionally useful, **100+** confident.
  Sources: [Ellis on high PMF / low retention](https://seanellis.substack.com/p/high-pmf-score-but-low-retention),
  [Sean Ellis test guide](https://www.koji.so/docs/sean-ellis-test-product-market-fit),
  [40 % rule overview](https://www.fitsignal.com/blog/sean-ellis-40-percent-test).
- **Superhuman PMF engine** (Rahul Vohra) — segment by the *very disappointed*
  cohort to find the high-expectation customer (HXC); ask fans what they love
  and fence-sitters what blocks them; split the roadmap 50/50. Took Superhuman
  from 22 % to 58 % in a year. Sources:
  [Superhuman blog](https://blog.superhuman.com/how-superhuman-built-an-engine-to-find-product-market-fit/),
  [First Round Review](https://review.firstround.com/how-superhuman-built-an-engine-to-find-product-market-fit/).
- **The Mom Test** (Rob Fitzpatrick) — talk about their life not your idea;
  ask about specific past behaviour, not hypotheticals; deflect compliments;
  seek commitments (time, reputation, money). Source:
  [Sachin Rekhi's primer](https://www.sachinrekhi.com/p/the-mom-test-rob-fitzpatrick),
  [mtlynch notes](https://mtlynch.io/book-reports/the-mom-test/).
- **Marty Cagan's four risks** — value, usability, feasibility, business
  viability. Used as the spine of the Tier A rubric. (Cagan, *Inspired*.)

## Usability measurement

- **SUS (System Usability Scale)** — 10 items, 0–100. **68 = average (C)**,
  **80.3+ = A / top 10 %**, **< 51 = F**. Curved grades from Sauro & Lewis over
  241 studies. Sources: [MeasuringU](https://measuringu.com/sus/),
  [UXtweak guide](https://blog.uxtweak.com/system-usability-scale/).
- **Nielsen severity scale** — 0 not a problem · 1 cosmetic · 2 minor · 3 major
  · 4 catastrophe (fix before release). Rate on frequency × impact ×
  persistence. Source: [NN/g](https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/),
  [MeasuringU](https://measuringu.com/rating-severity/).
- **Nielsen's 10 heuristics** — visibility of status, match to real world,
  user control, consistency, error prevention, recognition over recall,
  flexibility, minimalist design, error recovery, help. (In source framework.)
- **Laws of UX** (Yablonski) — Fitts (bigger/closer targets), Hick (fewer
  choices, progressive disclosure), Jakob (users expect your app to work like
  the ones they already use), Miller, Peak-end. Heuristics say *what* to check,
  laws say *why*. Source: [Looppanel summary](https://www.looppanel.com/blog/laws-of-ux),
  lawsofux.com.
- **Baymard method** — 7-point grading per guideline, guidelines weighted by
  observed impact in usability testing; e-commerce specific but the *weighted
  heuristic* approach is the model for the UX Design sub-rubric. Source:
  [Baymard methodology](https://baymard.com/research/methodology).
- **5-user rule** — Nielsen: five users surface ~85 % of usability problems in
  a given flow; run more rounds, not bigger rounds.

## Performance

- **Core Web Vitals** at the **75th percentile** of real users: LCP **< 2.5 s**
  good / > 4.0 s poor; INP **< 200 ms** / > 500 ms; CLS **< 0.1** / > 0.25. All
  three must pass at p75. Sources:
  [corewebvitals.io](https://www.corewebvitals.io/core-web-vitals),
  [2026 thresholds](https://webhelpagency.com/blog/core-web-vitals-2026/).

## Security & privacy

- **OWASP ASVS Level 1** — the floor for every app: defends against
  easy-to-discover vulns (OWASP Top 10); verifiable black-box, no source needed.
  L2 for apps handling sensitive data. Source:
  [OWASP ASVS Using](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x03-Using-ASVS.md),
  [Developer Guide](https://devguide.owasp.org/en/03-requirements/05-asvs/).
- **WCAG 2.2 AA** — the accessibility target; W3C's recommended version.
  Check with axe on core journeys + one keyboard pass + one screen-reader pass.

## Content correctness (the gap the source framework missed)

For any app whose output is a *fact* — quotes, scripture, citations, medical,
legal, financial, reference data, RAG answers — correctness is a trust gate,
not a quality nice-to-have.

- **RAG metrics** (RAGAS / DeepEval / TruLens): **faithfulness** = supported
  claims ÷ total claims (target ≥ 0.95); **context precision / recall**;
  **answer relevancy**; **hallucination rate** (claims no retrieved chunk
  supports); **citation accuracy** (does the cited source actually contain
  the claim; automated attribution ~80–90 % agreement with humans, so keep a
  human sample). Sources: [Vectara on RAGAS](https://www.vectara.com/blog/evaluating-rag),
  [Deepchecks](https://deepchecks.com/rag-evaluation-metrics-answer-relevancy-faithfulness-accuracy/),
  [Braintrust](https://www.braintrust.dev/articles/rag-evaluation-metrics).
- **Attribution correctness** — separate from faithfulness: is the *speaker /
  author / source* right? Pipeline defaults (one speaker per file) are the
  usual root cause. Sample 20–50 outputs by hand; zero tolerance for
  misattribution in a scripture or quotation product.
- **Provenance** — is the corpus licence documented? Are dates/titles
  complete? "Not listed" fields propagate into user-facing "unspecified"
  citations.
- **User loop** — a "report this" affordance on every output turns users into
  QA and is itself E2 evidence.

## Measurement for small apps

- **HEART** (Google): Happiness, Engagement, Adoption, Retention, Task
  success. Pick one goal → signal → metric per letter; do not track all five
  at once pre-PMF.
- **North Star**: one value metric + ≤ 3 input metrics + guardrails
  (satisfaction, latency, errors, cost).
- **Activation ≠ registration.** Define the first-value event before choosing
  an analytics tool. Self-hosted **Umami** or **Plausible** are a good default
  for self-hosted VPS apps (privacy-friendly, no cookie banner needed in most
  configurations, one script tag). An analytics import that targets a platform
  the app is not hosted on (e.g. `@vercel/analytics` on a systemd box) sends
  nothing and scores 0.

## Delivery

- **DORA five**: lead time, deploy frequency, change-fail rate, failed-deploy
  recovery time, deployment rework rate. Pre-PMF: just know them roughly.
- **Dual-env standard** (a common house rule): `main` = prod,
  dev on branches, guarded `deploy.sh <dev|prod>`, DB dump before deploy,
  `DEPLOYED_VERSION` stamp. Scoring Engineering 3 requires this shape.

## What the source framework already covers well (do not duplicate)

Gates before averages · E0–E4 evidence ladder · refusal to infer behaviour
from code · cadence over benchmarks · framework-as-lenses table · the 23
dimension matrix with pitfalls and metrics · the review checklist and output
schema. Read `framework-source.md` §Executive summary, §Evaluation model, and
§AI-driven app review checklist when in doubt; skip the case studies.
