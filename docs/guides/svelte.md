---
title: Svelte
description: use:reveal, use:parallax, use:track and use:story.
---

```sh
pnpm add @sweberdev/sigmoid @sweberdev/sigmoid-svelte
```

Svelte 4 and 5, SvelteKit included. The package is a set of plain actions, so there is nothing to compile and nothing to configure.

## Actions

```svelte
<script lang="ts">
  import { reveal, parallax, track, story } from "@sweberdev/sigmoid-svelte";
  import "@sweberdev/sigmoid/sigmoid.css";

  let progress = 0;
  let step = 0;
</script>

<h2 use:reveal={"fade-up"}>Our work</h2>

{#each items as item, i}
  <li use:reveal={{ preset: "scale-in", shift: i * 8 }}>{item.name}</li>
{/each}

<img use:parallax={40} src="hero.jpg" alt="" />

<p use:track={{ onProgress: (p) => (progress = p), range: "entry 0% cover 50%" }}>
  {Math.round(progress * 100)} %
</p>

<section use:story={{ steps: 3, onStep: (i) => (step = i) }} style="height: 300vh">
  <div style="position: sticky; top: 0">Step {step + 1} of 3</div>
</section>
```

An action restarts only when its parameters change by value, not on every update, and cancels the animation when the node is removed. The options are the same as in the [JavaScript API](javascript.md). Actions run in the browser only, so server-side rendering is safe.
