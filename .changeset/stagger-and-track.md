---
"@sweberdev/sigmoid": minor
"@sweberdev/sigmoid-react": minor
---

Stagger and scroll progress as a number.

- `reveal(targets, { stagger: 8 })` starts each further element later; `shift` moves a single range. `data-sigmoid` lists stagger with `--sigmoid-index` and `--sigmoid-stagger`, also without JavaScript.
- `track(targets, (progress, el) => …)` reports the view progress for counters, video or canvas.
- React: `shift` on `Reveal` and the `useScrollProgress` hook.
