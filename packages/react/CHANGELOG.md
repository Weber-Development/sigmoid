# @sweberdev/sigmoid-react

## 0.2.0

### Minor Changes

- c5f08ec: Stagger and scroll progress as a number.

  - `reveal(targets, { stagger: 8 })` starts each further element later; `shift` moves a single range. `data-sigmoid` lists stagger with `--sigmoid-index` and `--sigmoid-stagger`, also without JavaScript.
  - `track(targets, (progress, el) => …)` reports the view progress for counters, video or canvas.
  - React: `shift` on `Reveal` and the `useScrollProgress` hook.

### Patch Changes

- Updated dependencies [c5f08ec]
  - @sweberdev/sigmoid@0.2.0

## 0.1.0

### Minor Changes

- e01d945: First release: `reveal`, `parallax`, `scrub` and `progress` on native CSS scroll timelines with a small fallback, `data-sigmoid` attributes in `sigmoid.css`, spring, logistic and Bézier easings as CSS `linear()`, and React components and hooks.

### Patch Changes

- Updated dependencies [e01d945]
  - @sweberdev/sigmoid@0.1.0
