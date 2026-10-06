---
"@sweberdev/sigmoid": minor
"@sweberdev/sigmoid-react": minor
"@sweberdev/sigmoid-vue": minor
"@sweberdev/sigmoid-svelte": minor
---

Svelte, linked animations and pinned sections, tested in three browsers.

- New package `@sweberdev/sigmoid-svelte`: the actions `use:reveal`, `use:parallax`, `use:track` and `use:story`.
- Linked animations: `data-sigmoid-timeline` and `data-sigmoid-follow` let one element drive others, started by `init()` in every browser. In JavaScript the same is `reveal(targets, { subject })`.
- `data-sigmoid-pin` keeps the first child of a tall section in view with `position: sticky`; `--sigmoid-pin-length` sets the length.
- CI now runs the scroll scenarios in Chromium, Firefox and WebKit and compares them with expected values, not only native with fallback.
- Docs for Svelte and Astro.
