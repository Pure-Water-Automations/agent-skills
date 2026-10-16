---
name: readability-sweep
description: Use when asked to check a web app or site for anything hard or impossible to read (low contrast, text over photos or gradients, faded or translucent text, text hidden under sticky headers, overlays or other layers, clipped text) across light, dark and custom themes and phone width, or after a redesign, theme or colour change, before shipping a new look.
---

# Readability sweep

If a LOCAL.md file sits next to this SKILL.md, read it first — it holds this workspace's specifics (paths, tools, examples) and overrides the generic defaults below.

## Overview

Measure every visible piece of text against the pixels actually behind it, on every page, theme and viewport. The script hides all text, screenshots the real render, and compares each text colour with what is underneath, so photos, gradients, translucent bars and scrims all count. Computed-style contrast checkers miss exactly those cases, and eyeballing screenshots misses the rest.

Core rule: **the numbers find candidates; a screenshot decides.** Never fix, and never dismiss, a flag without looking at its screenshot.

## When not to use

- A full WCAG audit (focus order, ARIA, keyboard): use `rampstack-accessibility-audit`.
- Functional QA ("does it work"): use `qa-sweep`.
- A UX critique ("is it easy to use"): use `ui-usability-audit`.

## Workflow

1. **Run against dev or local.** Never production. Start the app's dev server.
2. **Find the app's theme toggle** in its source (the key, each value, and the class it sets on `<html>`). Every field and how to find the toggle: `references/config.md`.
3. **Write a config** from `scripts/config.example.json`: base URL, every route, each theme (OS `colorScheme` plus the app's own toggle through `localStorage`), desk and phone viewports. Add `actions` for dialogs, drawers and menus. Give scroll-driven pages `scrollStops`.
4. **Signed-in states (optional).** Omit `auth` to sweep signed-out only. Otherwise mint a session cookie for a fake test user with the app's own local-dev helper and secret, save it to a file, and point `auth.cookie.valueFile` at it. Localhost only; never a real account or a production secret.
5. **Sweep:** `node <skill>/scripts/sweep.mjs <config.json>` from the app's folder. Needs `playwright-core` (project or `~/node_modules`) and Chrome (`chrome` in the config for a non-Mac path). `ONLY=/about,/search` limits the routes. Run big sweeps in the background.
6. **Triage:** `node <skill>/scripts/triage.mjs <out>/findings.json`. It drops the known false alarms (table below), prints the rest worst first, then a **Coverage** section. A result of zero only counts if Coverage says every run measured text and every theme changed the page; a warning there means fix the config and sweep again.
7. **Second opinion with Impeccable** (`github.com/pbakaus/impeccable`): `npx -y impeccable detect --json <base><route>` per route, and `npx -y impeccable detect --json <source dirs>`. It catches typography and layout habits the sweep does not measure: line length over ~80 characters, tiny body text, all-caps body text, nested cards, cramped padding, flat type scale, em-dash overuse, animated height/width. Take those findings as real. Distrust its contrast and "hidden at rest" flags on scroll-driven or layered pages: it reads one frame with every layer present, so the sweep's per-position numbers win there.
8. **Look at the screenshot** of every remaining row (`<out>/shots/`). Real problems go in the fix list; artefacts get an explanation.
9. **Fix at the source** (patterns below), then re-run only the affected routes with `ONLY=`, then once against the deployed dev site.
10. **Report:** what was unreadable (contrast below 2:1, or covered), what was hard to read (below 4.5:1, or 3:1 for large text), what changed, what is left and why.

## Thresholds

WCAG AA: 4.5:1 for body text, 3:1 for large text (24px or more, or 18.66px bold). The script scores the 10th-percentile sample under each line, so one bright pixel in a photo doesn't fail a line, but a bright patch does.

## False alarms the triage drops (check `--all` once)

| Bucket | Why it is not a real problem |
|---|---|
| Screen-reader-only text | Clipped to 1px on purpose. |
| Disabled controls (`:disabled` or `aria-disabled="true"`) | WCAG exempts them. They are faded twice, so they score far too low. A control that only looks disabled (faded but enabled) is scored normally. |
| Under fixed/sticky chrome or a modal backdrop | Content scrolled under the header, passing under a floating button, or dimmed behind an open dialog. The sweep already skips the covered sample points and scores the visible rest; only text that is fully covered lands here. |
| CSS filter on an ancestor | The filter recolours pixels after the colour is read, so the number is wrong. Judge it by eye, and check whether the filter is intended (see Common mistakes). |

## Fix patterns

| What the sweep found | Fix |
|---|---|
| Text straight on a photo or bright video | A scrim *sibling* shaped to the text's corner or band, or move the photo away from the text column (mask, crop, or put it beside the text) |
| A fixed bar over changing imagery | Give the bar its own gradient ground in the page's canvas colour |
| A button that reads fine alone but not in its bar | A container rule (`.bar a { color: inherit }`) outranks the button class; add `.bar a.btn { color: … }` |
| Placeholders failing everywhere | The browser default is half-strength text. Set `input::placeholder, textarea::placeholder { color: var(--muted-foreground); opacity: 1 }`. Tailwind's preflight uses the same two selectors, so a bare `::placeholder` loses |
| Fine in light mode, 1–2:1 in dark | Hard-coded colours (`bg-[oklch(...)]`, `text-[#...]`, `bg-white`). Move them to theme tokens |
| Light text on a light fill in dark mode (gold, amber) | Fills that stay light in both themes need dark text in both |
| Nav text weak over a dark band | A translucent sticky header lets the band through; make it 95% opaque or more |
| Faded counts or labels (`opacity-60`) | Use the secondary text colour instead of opacity |
| Red "Delete" on a light ground | Darken the destructive token until it passes |
| Last lines under a floating help button on phones | Bottom padding on the footer |

## Common mistakes

- **Trusting a number without its screenshot.** Every artefact above once looked like a critical bug.
- **Trusting a clean run without Coverage.** A wrong theme key or a blank page also returns zero findings.
- **Parsing colours by hand.** Tailwind v4 emits `oklab()`, `lab()` and `color-mix()`; regex parsing reads faded text as near-black. The script resolves colours through a canvas; keep it that way.
- **Theme class names that collide with utilities.** A theme class called `sepia` (also `grayscale`, `invert`, `blur`, `contrast`) is also a Tailwind filter utility, so it filters the whole page, photos included. Rename it (`reading-sepia`) and keep the stored preference value.
- **Checking only the OS dark mode.** Test the app's own toggle too; it often runs through a different selector.
- **Sweeping production.** Signed-in states and actions write data. Dev or local only.
- **Stopping at the local fix.** Re-run against the deployed dev site; CSS caching and build differences do show up.
