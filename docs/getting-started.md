---
title: Getting started
description: Install Sigmoid and animate your first element on scroll.
---

```sh
pnpm add @sweberdev/sigmoid
```

With npm: `npm i @sweberdev/sigmoid`.

## Without JavaScript

1. Load the stylesheet once, e.g. in your root layout:

   ```ts
   import "@sweberdev/sigmoid/sigmoid.css";
   ```

2. Mark elements:

   ```html
   <h2 data-sigmoid="fade-up">Our work</h2>
   <img data-sigmoid="parallax" src="hero.jpg" alt="" />
   <div data-sigmoid="progress" class="reading-bar"></div>
   ```

3. Optional: cover browsers without native scroll timelines. `init()` does nothing where CSS already handles it.

   ```ts
   import { init } from "@sweberdev/sigmoid";
   init();
   ```

## With JavaScript

```ts
import { ease, reveal } from "@sweberdev/sigmoid";

reveal(".card", { keyframes: "scale-in", easing: ease.bouncy });
```

`reveal` accepts an element, a selector or a list. It returns a controller with `cancel()`.

## With React

```sh
pnpm add @sweberdev/sigmoid-react
```

```tsx
import { ease } from "@sweberdev/sigmoid";
import { Reveal } from "@sweberdev/sigmoid-react";

<Reveal as="article" preset="fade-up" easing={ease.bouncy}>…</Reveal>
```

Next: [the CSS attributes](guides/css.md), [the JavaScript API](guides/javascript.md) or [easing curves](guides/easing.md).
