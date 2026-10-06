---
title: Vue
description: v-reveal, v-parallax and composables.
---

```sh
pnpm add @sweberdev/sigmoid-vue
```

Vue 3.3 or newer. The package has no runtime of its own: the directives and composables call `@sweberdev/sigmoid`.

## Directives

Register them for the whole app, or import them where you need them:

```ts
import { createApp } from "vue";
import { SigmoidPlugin } from "@sweberdev/sigmoid-vue";
import "@sweberdev/sigmoid/sigmoid.css";

createApp(App).use(SigmoidPlugin).mount("#app");
```

```vue
<h2 v-reveal="'fade-up'">Our work</h2>
<li v-for="(item, i) in items" :key="item.id" v-reveal="{ preset: 'scale-in', shift: i * 8 }">
  {{ item.name }}
</li>
<img v-parallax="40" src="hero.jpg" alt="" />
```

`v-reveal` takes a preset name or an object with `preset` (or `keyframes`), `range`, `easing`, `shift`, `stagger` and `reducedMotion`. The animation restarts only when the value changes, not on every render, and it is cancelled when the element unmounts.

Without the plugin: `import { vReveal } from "@sweberdev/sigmoid-vue"` works with `<script setup>` as `v-reveal`.

## Composables

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useReveal, useScrollProgress, useStory } from "@sweberdev/sigmoid-vue";

const card = ref<HTMLElement | null>(null);
useReveal(card, { keyframes: "blur-in" });

const stat = ref<HTMLElement | null>(null);
const progress = useScrollProgress(stat, { range: "entry 0% cover 50%" }); // Ref<number>

const how = ref<HTMLElement | null>(null);
const { step } = useStory(how, { steps: 3 }); // Ref<number>
</script>
```

`useParallax`, `useScrub` and `useReducedMotion` work the same way. Server-side rendering is safe: everything starts in `onMounted`.
