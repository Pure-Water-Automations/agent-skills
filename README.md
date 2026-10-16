# Agent skills

Reusable skills for Claude Code (and other agents that read `SKILL.md` folders), from the
team at Pure Water Automations. Each folder is one skill: a `SKILL.md` with frontmatter
(`name`, `description`) plus any references or scripts it needs.

## Install

```bash
git clone https://github.com/Pure-Water-Automations/agent-skills ~/agent-skills
# Claude Code: link the ones you want into your skills folder
ln -s ~/agent-skills/rea-lite ~/.claude/skills/rea-lite
```

Update later with `git -C ~/agent-skills pull`.

**Your own specifics:** a skill reads a `LOCAL.md` placed next to its `SKILL.md` first, if
one exists. Put your paths, tools and examples there; it overrides the generic defaults and
is never part of this repo.

## Skills

<!-- skills:start -->
| Skill | What it does |
|---|---|
| [`rea-lite`](rea-lite/SKILL.md) | Use when the user wants one of their apps to work like a reference product — "make it feel like Miro", "copy Notion's/Linear's/Loom's X", "get it on par with <app>", "add all the essential <app>… |
| [`competitive-redesign`](competitive-redesign/SKILL.md) | Use when the user wants to improve or rethink a feature of one of their apps by learning from competitor products — "look at how Loom/Notion/Linear does it", "spin off agents to screenshot ours and… |
| [`app-scorecard`](app-scorecard/SKILL.md) | Score any app (the user's own or a competitor's) on a research-backed rubric and produce a reusable, comparable scorecard — 0–5 per dimension with an evidence grade, noncompensatory gates checked… |
| [`ui-usability-audit`](ui-usability-audit/SKILL.md) | Audit a UI/app for ease of use — usability, navigability, and how intuitive it is to learn — through the eyes of a specific target user, then deliver a VISUAL before/after report (a designed… |
| [`readability-sweep`](readability-sweep/SKILL.md) | Use when asked to check a web app or site for anything hard or impossible to read (low contrast, text over photos or gradients, faded or translucent text, text hidden under sticky headers, overlays… |
| [`qa-sweep`](qa-sweep/SKILL.md) | Pre-human-testing QA sweep of a web app driven by browser-automation. Reads a testing checklist source (a Notion testing DB, or an explicit page list), logs into the app once, then sweeps each… |
| [`feature-map`](feature-map/SKILL.md) | Use when an app needs a FEATURE_MAP.md (or one is stale), when a browser-driving/QA agent keeps flailing to find a screen, when triaging a vague bug report or a "???" screenshot against a web app, or… |
| [`check-open-source`](check-open-source/SKILL.md) | Use before writing an implementation plan, scaffold, or first code for any new library, tool, service, parser, integration, or app feature with a recognizable domain (e.g. "parse .ics", "OAuth device… |
| [`panel-brainstorm`](panel-brainstorm/SKILL.md) | Use when the user wants a multi-perspective brainstorm on a feature, app, or product area — "spin up agents with different personalities/job titles", "look at it from different angles", "panel of… |
| [`slides`](slides/SKILL.md) | Build a beautiful, animated, self-contained HTML slide deck from a rough outline, a topic, a document, or an existing PowerPoint — instead of dragging boxes around in PowerPoint or Google Slides.… |
<!-- skills:end -->

## Notes

- This repo is generated: skills are edited in our workspace and synced here automatically,
  so pull requests are read but changes land through that sync.
- MIT licensed. No skill here needs an API key; skills that call external services say so.
