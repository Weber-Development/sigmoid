---
title: Astro
description: Sigmoid in Astro, with view transitions.
---

Astro needs no adapter: `data-sigmoid` markup works in `.astro` files, and one small script starts the fallback.

```astro
---
import "@sweberdev/sigmoid/sigmoid.css";
---

<h2 data-sigmoid="fade-up">Our work</h2>
<li data-sigmoid="scale-in" style="--sigmoid-index: 2">…</li>

<script>
  import { init } from "@sweberdev/sigmoid";
  init();
</script>
```

Scripts in `.astro` files are bundled and run once. In browsers with scroll timelines `init()` does nothing, so the page stays free of JavaScript work.

## With view transitions

With `<ClientRouter />` the page content is replaced on navigation, so start Sigmoid again after each one and stop the previous run:

```astro
<script>
  import { init } from "@sweberdev/sigmoid";

  let stop = () => {};
  document.addEventListener("astro:page-load", () => {
    stop();
    stop = init();
  });
</script>
```

## Interactive parts

For islands, use the adapter of your framework: [React](react.md), [Vue](vue.md) or [Svelte](svelte.md).
