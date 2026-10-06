---
"@sweberdev/sigmoid": minor
"@sweberdev/sigmoid-react": minor
"@sweberdev/sigmoid-vue": minor
---

Horizontal scrolling, text splitting and counters.

- `axis: "inline"` for `reveal`, `track` and `story` (and `data-sigmoid-axis="inline"` in CSS), natively and in the fallback.
- `scrub` takes `range: [from, to]` to run over a part of the scroll distance.
- `splitText()` splits an element into words or characters, and `reveal` takes a `subject` so a whole headline drives its words. Screen readers keep the original text.
- `data-sigmoid="count"` counts a number up without JavaScript (whole numbers, `--sigmoid-count`).
- The Chromium check in CI now also covers the inline axis, scrub ranges and the counter.
- The docs get a recipes page.
