# @sweberdev/sigmoid-svelte

## 0.7.0

### Minor Changes

- cf31faa: Faster fallback, `refresh()`, API stability and a benchmark.

  - The JavaScript fallback measures an element once and reuses the position until the layout changes (resize, an element changing size, the page getting taller or wider) and skips writes when nothing moved. With 300 elements the script time dropped from about 340 ms to about 70 ms for a full scroll.
  - New `refresh()` measures everything again on the next frame, for changes that only move elements.
  - Tests now check the export list of every package, so the public API is fixed for 1.x. New docs: stability and deprecation policy, benchmark against GSAP ScrollTrigger, Motion and AOS (`pnpm bench`, with the results in the docs), and migration guides from GSAP ScrollTrigger, AOS and Motion.

### Patch Changes

- Updated dependencies [cf31faa]
  - @sweberdev/sigmoid@0.7.0

## 0.6.0

### Minor Changes

- 59e869d: Svelte, linked animations and pinned sections, tested in three browsers.

  - New package `@sweberdev/sigmoid-svelte`: the actions `use:reveal`, `use:parallax`, `use:track` and `use:story`.
  - Linked animations: `data-sigmoid-timeline` and `data-sigmoid-follow` let one element drive others, started by `init()` in every browser. In JavaScript the same is `reveal(targets, { subject })`.
  - `data-sigmoid-pin` keeps the first child of a tall section in view with `position: sticky`; `--sigmoid-pin-length` sets the length.
  - CI now runs the scroll scenarios in Chromium, Firefox and WebKit and compares them with expected values, not only native with fallback.
  - Docs for Svelte and Astro.

### Patch Changes

- Updated dependencies [59e869d]
  - @sweberdev/sigmoid@0.6.0
