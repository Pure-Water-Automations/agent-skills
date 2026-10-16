# Sweep config reference

One JSON file, passed to `scripts/sweep.mjs`. Relative paths resolve from the config's own folder. Start from `scripts/config.example.json`.

## Top level

| Field | Required | Default | Meaning |
|---|---|---|---|
| `base` | yes | | App origin, e.g. `http://localhost:3000`. Dev or local only. |
| `pages` | yes | | Routes to sweep (below). |
| `out` | no | `readability-sweep` | Output folder: `findings.json`, `coverage.json`, `shots/`. |
| `themes` | no | light + OS dark | See Themes. |
| `viewports` | no | desk 1440×900, phone 390×844 | `{ "name", "width", "height" }` |
| `auth` | no | none | Omit it to sweep signed-out only. With it, pages marked `signedIn` are swept twice. |
| `settleMs` | no | 900 | Wait after load before measuring. |
| `maxScroll` | no | 9000 | Stop scrolling a long page after this many px. |
| `removeSelectors` | no | `["nextjs-portal"]` | Dev overlays to delete before measuring. |
| `chrome` | no | macOS Chrome if present | Path to a Chrome/Chromium binary. Without Mac Chrome and without this, playwright's bundled browser is used (`npx playwright install chromium`). |

## Themes

`{ "name", "colorScheme": "light" | "dark", "localStorage": { key: value }, "viewports": ["desk"] }`

- `colorScheme` emulates the OS setting (`prefers-color-scheme`).
- `localStorage` is written before any page script runs, which is how an app's own theme toggle is set.
- `viewports` limits a theme to some viewports (e.g. skip a rarely used theme on phones).

**Finding an app's theme toggle.** Grep the source for it: `localStorage.setItem` / `getItem` near the words theme, dark, mode, reading; `classList.add` or `data-theme` on `<html>`; the inline pre-paint script in the root layout. Note the key, each value, and the class or attribute it produces. The coverage check in triage warns when a theme left the page unchanged.

## Pages

| Field | Meaning |
|---|---|
| `path` | Route including query, e.g. `/search?q=forgiveness`. |
| `signedIn` | Also sweep this page signed in (needs top-level `auth`). |
| `settleMs` | Per-page wait, e.g. longer for pages that fetch results. |
| `themes` | Only these theme names (e.g. a fixed-look page needs one). |
| `scrollStops` | Positions in viewport-heights, for scroll-driven pages. Replaces the default scroll-by-85% walk. |
| `scrollWaitMs` | Wait at each stop (default 1400 with `scrollStops`, 250 without). |
| `actions` | `[{ "name", "click", "waitMs" }]`: open a dialog, drawer or menu, then measure. `click` is a Playwright selector (`button:has-text('Filters')`, `#cite-1 button:has-text('More')`). The first match is clicked from the top of the page. |

## Auth

`{ "cookie": { "name": "<session cookie>", "valueFile": "session.token" } }` or `"value": "…"` inline.

Mint the value for a fake test user with the app's own session-signing helper and its local `.env` secret. Localhost only. Never a real account, never a production secret, and never commit the token file.

## Speed

Roughly 5–15 seconds per page per theme×viewport, more for long pages, `actions` and `scrollStops`. Run big sweeps in the background; use `ONLY=/a,/b` to re-run a few routes.
