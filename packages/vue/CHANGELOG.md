# @sweberdev/sigmoid-vue

## 0.5.0

### Minor Changes

- 83d7a41: Horizontal scrolling, text splitting and counters.

  - `axis: "inline"` for `reveal`, `track` and `story` (and `data-sigmoid-axis="inline"` in CSS), natively and in the fallback.
  - `scrub` takes `range: [from, to]` to run over a part of the scroll distance.
  - `splitText()` splits an element into words or characters, and `reveal` takes a `subject` so a whole headline drives its words. Screen readers keep the original text.
  - `data-sigmoid="count"` counts a number up without JavaScript (whole numbers, `--sigmoid-count`).
  - The Chromium check in CI now also covers the inline axis, scrub ranges and the counter.
  - The docs get a recipes page.

### Patch Changes

- Updated dependencies [83d7a41]
  - @sweberdev/sigmoid@0.5.0

## 0.4.0

### Minor Changes

- ee47cec: New package `@sweberdev/sigmoid-vue`: the `v-reveal` and `v-parallax` directives, a plugin and the composables `useReveal`, `useParallax`, `useScrub`, `useScrollProgress`, `useStory` and `useReducedMotion`. CI now also runs a real Chromium check that the native CSS timeline and the JavaScript fallback give the same result, on the page and inside a scroll container.

### Patch Changes

- Updated dependencies [ee47cec]
  - @sweberdev/sigmoid@0.4.0
