---
"@sweberdev/sigmoid": minor
"@sweberdev/sigmoid-react": minor
---

Scroll stories, scroll containers and Tailwind CSS v4.

- `story()` splits a pinned section into steps and sets `data-sigmoid-step` and `--sigmoid-progress`; React gets `useStory`.
- The fallback now measures elements against their nearest scroll container, like `view()`, so reveals inside scrolling panels work in every browser.
- Two new presets: `rotate-in` and `flip-up`.
- `@sweberdev/sigmoid/tailwind.css` adds `ease-bouncy`, `ease-sigmoid` and the other curves to Tailwind CSS v4.
