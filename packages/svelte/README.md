# @sweberdev/sigmoid-svelte

Svelte actions for [Sigmoid](https://packages.sweber.dev/sigmoid): scroll reveals, parallax, scroll progress and scroll stories on native CSS scroll timelines, with spring and S-curve easings, a tiny fallback and reduced motion respected by default.

```sh
pnpm add @sweberdev/sigmoid @sweberdev/sigmoid-svelte
```

```svelte
<script lang="ts">
  import { reveal, parallax, track } from "@sweberdev/sigmoid-svelte";
  let progress = 0;
</script>

<h2 use:reveal={"fade-up"}>Our work</h2>
<li use:reveal={{ preset: "scale-in", shift: 16 }}>…</li>
<img use:parallax={40} src="hero.jpg" alt="" />
<p use:track={{ onProgress: (p) => (progress = p) }}>{Math.round(progress * 100)} %</p>
```

Svelte 4 and 5. Plain actions, nothing to compile.

**Docs and live demo:** [packages.sweber.dev/sigmoid/docs](https://packages.sweber.dev/sigmoid/docs)

MIT licensed.
