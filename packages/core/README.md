# Sigmoid

Scroll motion without the JavaScript tax. Sigmoid runs reveals, parallax and scroll-linked animations on **native CSS scroll timelines**, ships **spring and S-curve easings as CSS `linear()`**, falls back to one tiny scroll listener where needed and **respects reduced motion by default**. About 2 kB for a reveal.

**Docs and live demo:** [packages.sweber.dev/sigmoid](https://packages.sweber.dev/sigmoid)

| Package | What it does |
|---|---|
| [`@sweberdev/sigmoid`](packages/core) | `reveal`, `parallax`, `scrub`, `progress`, `init`, easing curves, `sigmoid.css` |
| [`@sweberdev/sigmoid-react`](packages/react) | `Reveal`, `Parallax`, `ScrollProgress`, `useReveal`, `useScrub`, `useReducedMotion` |
| [`@sweberdev/sigmoid-vue`](packages/vue) | `v-reveal`, `v-parallax`, `useReveal`, `useScrollProgress`, `useStory` |
| [`@sweberdev/sigmoid-svelte`](packages/svelte) | `use:reveal`, `use:parallax`, `use:track`, `use:story` |

## Zero JavaScript

```ts
import "@sweberdev/sigmoid/sigmoid.css";
```

```html
<h2 data-sigmoid="fade-up">Our work</h2>
<img data-sigmoid="parallax" src="hero.jpg" alt="" />
<div data-sigmoid="progress" class="reading-bar"></div>
```

Browsers with scroll-driven animations animate this with CSS alone. `init()` from `@sweberdev/sigmoid` covers the others.

## JavaScript

```ts
import { ease, parallax, reveal, scrub } from "@sweberdev/sigmoid";

reveal(".card", { keyframes: "scale-in", range: "entry 0% cover 40%", easing: ease.bouncy });
parallax(".hero img", { distance: 80 });
scrub(".sky", [{ backgroundColor: "#bde0fe" }, { backgroundColor: "#03045e" }]);
```

## Easing that works in CSS and JavaScript

```ts
import { spring } from "@sweberdev/sigmoid/easing";

const pop = spring({ duration: 0.5, bounce: 0.3 });
pop(0.5);      // 1.037
`${pop}`;      // "linear(0, 0.0009 0.42%, …, 1)"
pop.duration;  // 819 (ms until it rests)
```

Physically correct springs, the logistic S-curve and Bézier curves, simplified to 20 to 40 `linear()` stops. Use them with Motion, GSAP, CSS transitions or Tailwind.

## React

```tsx
import { ease } from "@sweberdev/sigmoid";
import { Reveal, ScrollProgress } from "@sweberdev/sigmoid-react";

<ScrollProgress className="fixed inset-x-0 top-0 h-1 bg-black" />
<Reveal as="article" preset="fade-up" easing={ease.bouncy}>…</Reveal>
```

## Size

| Import | min+gzip |
|---|---|
| `reveal` + `init` | about 3.1 kB |
| everything | about 4.9 kB |
| `@sweberdev/sigmoid/easing` | about 1.3 kB |

`pnpm size` checks these budgets in CI.

## Development

```sh
pnpm install
pnpm build && pnpm test && pnpm lint && pnpm size
```

Changes go through pull requests with a changeset (`pnpm changeset`). Merging the version PR publishes to npm.

## Licence

MIT © Seya Weber
