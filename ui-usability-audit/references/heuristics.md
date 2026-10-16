# Heuristics & scoring rubric

Read this during step 3 (score the lenses) and step 4 (pull findings). It exists so the audit is consistent and concrete instead of vibes. Every check is framed as a question about the **named user doing their job** — if a heuristic doesn't block that, it's not a finding worth reporting.

## The three lenses

### 1 · Intuitive learning — "can they understand it without training?"
The test: a first-time user, no walkthrough, no one sitting next to them. Do they get it?
- **Jargon & acronyms.** Are there words from a different world (gaming, military, internal codenames, finance acronyms) layered on the user's domain? Is any acronym used before it's spelled out? List them — this becomes the relabel glossary.
- **Unexplained mechanics.** Are there systems (points, XP, ranks, tiers, badges, streaks) whose *purpose* is never stated? "Why does this matter to me?" should be answerable on screen.
- **Numbers without meaning.** Is a metric shown raw ("142 → 98", "127.8% of goal", "+1,234") with no plain interpretation and no good/bad signal?
- **Is the only explanation optional/hidden?** A great onboarding tour that's gated behind a tiny "?" means first-run is still cold. Understanding shouldn't depend on remembering to take a tour.
- **Labels vs. meaning.** Do section/tab names describe the *data table* ("Gatherings", "Treasury") or the *user's task* ("Attendance", "Money")?

### 2 · Navigability — "can they find things and move between them?"
- **Is there a home base?** Does the app open on "here's what needs you," or on a generic screen / animation / dead landing?
- **Overlapping surfaces.** Are there multiple pages that do nearly the same thing (two "dashboards", a "console" and a "command center")? The user won't know which to use.
- **Nav visibility & hierarchy.** Is navigation obvious, or tucked into a corner as unlabeled chips? Is the most-used thing first?
- **Nesting depth.** Count the levels: page → tab → sub-tab → long scroll. Two+ levels of tabs + scrolling = lost.
- **Action scatter.** Is the same action reachable from several places with no canonical home? Can the user find "the thing I do every week" fast?

### 3 · Usefulness — "does it actually help them do the job?"
- **Read vs. do balance.** How many screens are passive dashboards vs. let the user *act*? A busy owner needs "who do I follow up with / what do I do today," not just charts.
- **Is the useful thing buried?** Often the single most valuable feature is behind game framing and several clicks. Surface-area should match value.
- **Close the loop.** After an action, does the user see status (assigned, contacted, done), or does it dead-end? Trust dies at dead-ends.
- **Job coverage.** For each top job-to-be-done, is there a clear path? Map jobs → screens and flag the gaps.
- **Today/this-week view.** Is there a prioritized "what matters now," or must the user assemble it from tabs themselves?

## Cross-cutting checks (apply to every screen)
- **Tone fit.** Does the voice match the user's world and emotional state? Competitive ranking/negative scores can demotivate; playful gaming can alienate older/serious users. Flag tone as a *decision*, not a bug.
- **Readability.** Tiny type (sub-11px), low-contrast text, pervasive ALL-CAPS + heavy letter-spacing (slows reading), dense number grids. Note who it hurts (e.g., older users).
- **Mobile / responsive.** Do the core flows survive a phone — nav, the main action, charts?
- **Feedback & states.** Are loading, empty, error, and success states handled and *clear* (plain-language toasts, not codes)?
- **Consistency.** Inconsistent capitalization, label styles, or number formats (full USD vs "$42.5k") that make the app feel unsettled.

## Always: preserve strengths
List what genuinely works and should be **kept** — care-first copy, a real workflow, a delightful detail. Two reasons: an audit that's all-negative gets dismissed, and a redesign that doesn't know the strengths will throw them out.

## Grading
Letter grades (A–F) per lens, each with the single core problem in one line. Calibrate honestly:
- **A/B** — works for the user with little/no help; minor polish.
- **C** — usable but friction-heavy; needs training or guessing.
- **D/F** — the user is blocked or actively misled on a core job.
Grades are a communication device for the owner, not a precise score — the findings and the visual do the real work.
