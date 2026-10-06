# @sweberdev/sigmoid

## 0.5.0

### Minor Changes

- 83d7a41: Horizontal scrolling, text splitting and counters.

  - `axis: "inline"` for `reveal`, `track` and `story` (and `data-sigmoid-axis="inline"` in CSS), natively and in the fallback.
  - `scrub` takes `range: [from, to]` to run over a part of the scroll distance.
  - `splitText()` splits an element into words or characters, and `reveal` takes a `subject` so a whole headline drives its words. Screen readers keep the original text.
  - `data-sigmoid="count"` counts a number up without JavaScript (whole numbers, `--sigmoid-count`).
  - The Chromium check in CI now also covers the inline axis, scrub ranges and the counter.
  - The docs get a recipes page.

## 0.4.0

### Minor Changes

- ee47cec: New package `@sweberdev/sigmoid-vue`: the `v-reveal` and `v-parallax` directives, a plugin and the composables `useReveal`, `useParallax`, `useScrub`, `useScrollProgress`, `useStory` and `useReducedMotion`. CI now also runs a real Chromium check that the native CSS timeline and the JavaScript fallback give the same result, on the page and inside a scroll container.

## 0.3.0

### Minor Changes

- 1ecf9ae: Scroll stories, scroll containers and Tailwind CSS v4.

  - `story()` splits a pinned section into steps and sets `data-sigmoid-step` and `--sigmoid-progress`; React gets `useStory`.
  - The fallback now measures elements against their nearest scroll container, like `view()`, so reveals inside scrolling panels work in every browser.
  - Two new presets: `rotate-in` and `flip-up`.
  - `@sweberdev/sigmoid/tailwind.css` adds `ease-bouncy`, `ease-sigmoid` and the other curves to Tailwind CSS v4.

## 0.2.0

### Minor Changes

- c5f08ec: Stagger and scroll progress as a number.

  - `reveal(targets, { stagger: 8 })` starts each further element later; `shift` moves a single range. `data-sigmoid` lists stagger with `--sigmoid-index` and `--sigmoid-stagger`, also without JavaScript.
  - `track(targets, (progress, el) => …)` reports the view progress for counters, video or canvas.
  - React: `shift` on `Reveal` and the `useScrollProgress` hook.

## 0.1.0

### Minor Changes

- e01d945: First release: `reveal`, `parallax`, `scrub` and `progress` on native CSS scroll timelines with a small fallback, `data-sigmoid` attributes in `sigmoid.css`, spring, logistic and Bézier easings as CSS `linear()`, and React components and hooks.
