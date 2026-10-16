# Design principles pass: the guidelines without the look

Read this during step 3b. These rules come from Apple's Human Interface Guidelines, via the `ebuntario/apple-hig` skill pack (github.com/ebuntario/apple-hig, MIT). They are translated here for web apps and made brand-neutral.

**Apply the rules and keep the product's own look.** Don't recommend glass, SF Pro, iOS blue or Apple chrome unless the user asks for that look. A pixel-RPG app keeps its pixel identity, and a pastor's console keeps its warmth. What changes is how the UI behaves. Do users hit their targets, can they read the text, can they see keyboard focus, and do they get consistent feedback? A typical reference case: for a pixel-art app, a "refreshed windowskin" that kept the art style and fixed targets, type and focus won out over a full HIG reskin.

Frame every finding for the named user, as in heuristics.md. For example: "Buttons are 30px tall, so a VA on a trackpad misses them."

## The checklist

Each row gives a floor or rule and the cheapest way to verify it in source. Grep counts make strong evidence, for example "299 hex literals".

| # | Principle | Floor / rule (web) | How to check in source |
|---|---|---|---|
| 1 | **Hit targets** | At least 44×44 px for every tap or click target. Primary controls on a busy surface should be 48–56 px. Pointer-only desktop controls can go to 28 px, but only when they are dense tools. | Grep `padding:` / `height:` on buttons, and look for `fontSize: 12` buttons with `5px` padding (about 30 px tall). |
| 2 | **Type floor and scale** | Body text 15–17 px. Nothing readable under 11 px. Use one named scale (about 8–10 steps), not ad-hoc sizes. Use `rem` so browser zoom works. | `grep -o "fontSize: [0-9]*"` then histogram the results. Count the uses under 11. |
| 3 | **Semantic color tokens** | Colors come from named roles (label, secondary, background, separator, accent, danger, success), not literals. Design light and dark from one token set, even if only one ships. | Count hex and `rgba(` literals against token uses. Look for `prefers-color-scheme`. |
| 4 | **Don't rely on color alone** | State (on/off, error, online) also has an icon, a label or a shape. Colors that must be told apart also differ in lightness. | Status dots with no text, and red/green-only pairs. |
| 5 | **Contrast** | Text at least 4.5:1, or 3:1 at 24 px and up. Brand fills under white text often fail, for example gold or light teal. | Check the accent colors against the text colors placed on them. |
| 6 | **Visible focus** | A clear `:focus-visible` ring on every interactive element. Never `outline: none` without a replacement. | Grep `outline: "none"` / `outline:none`, and `focus-visible`. |
| 7 | **Labels for assistive tech** | Icon-only buttons have `aria-label`. Inputs have a `<label>`. Decorative icons are `aria-hidden`. Only real `<button>` and `<a>` elements are clickable, never a clickable `div`. | Count `<button` vs `aria-label` per big file. Grep `onClick` on `div`/`span`. |
| 8 | **Icon system** | One consistent icon set, drawn on one grid in one stroke style. No emoji or dingbats as UI icons (✕ ✓ ⚠ ✨), because they render differently on every OS. | Grep for emoji and dingbat characters in UI files. |
| 9 | **Reduced motion** | Honor `prefers-reduced-motion`. Swap springs, parallax, bounces and confetti for fades, or drop them. | Grep `prefers-reduced-motion` / `matchMedia`. Count keyframes and transitions that ignore it. |
| 10 | **Layers: content vs controls** | Controls (toolbars, HUDs, nav) read as a separate, consistent layer above the content. Emphasis is rare: only a few highlighted controls per screen. When everything is gold, nothing is. | Count "primary" or accent-styled buttons per screen. |
| 11 | **Consistency of components** | One button family (primary, secondary, destructive, icon), one panel style, one input style, and about five radii. No drifted copies. | Find duplicate style objects, for example two `windowBox`/`win` variants, or three button styles. |
| 12 | **Platform-correct navigation** | Wide screens use a sidebar with grouped sections, not 8+ tabs. Phones use a bottom bar or a stack. Nesting is at most two levels. | Count the top-level tabs. Check the mobile layout of the nav. |
| 13 | **Hover isn't the only affordance** | Anything revealed on hover must also be reachable by keyboard and touch. Hover styles belong in CSS, not JS `onMouseOver`. | Grep `onMouseOver` / `onMouseEnter` style mutation. |
| 14 | **Writing** | Sentence case on buttons and labels. Verbs on actions ("Save map", not "Map"). Platform-neutral words ("Select", not "Tap", on a web app used with a mouse). | Scan button text and headings. |
| 15 | **Safe areas and small screens** | On phones, nothing interactive sits under the notch or home indicator, and there is no horizontal page scroll. The layout works at 390 px width with a 16 px gutter. | `env(safe-area-inset-*)` usage. Test at a 390 px viewport. |

## How to report it

- Put a **Fit and finish** row in the scorecard alongside the three lenses: a letter grade plus the single worst principle breach.
- In the before/after pairs, the "after" applies these rules **in the product's existing visual family**. Show the same brand with bigger targets, readable type, real icons and a focus ring.
- Principle findings usually land in **Quick wins**, because they are mechanical and low risk. Moving hardcoded styles into tokens is the usual **Bigger bet**, and it unlocks the rest.
- Name any trade-off honestly. For example, glass or blur over a constantly repainting canvas costs frames, and most users on Windows never see SF Pro.
