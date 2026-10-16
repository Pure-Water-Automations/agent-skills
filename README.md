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
<!-- skills:end -->

## Notes

- This repo is generated: skills are edited in our workspace and synced here automatically,
  so pull requests are read but changes land through that sync.
- MIT licensed. No skill here needs an API key; skills that call external services say so.
