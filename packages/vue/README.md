# @sweberdev/sigmoid-vue

Vue 3 directives and composables for [Sigmoid](https://packages.sweber.dev/sigmoid): scroll reveals, parallax, scroll progress and scroll stories on native CSS scroll timelines, with spring and S-curve easings, a tiny fallback and reduced motion respected by default.

```sh
pnpm add @sweberdev/sigmoid @sweberdev/sigmoid-vue
```

```ts
import { createApp } from "vue";
import { SigmoidPlugin } from "@sweberdev/sigmoid-vue";

createApp(App).use(SigmoidPlugin).mount("#app");
```

```vue
<h2 v-reveal="'fade-up'">Our work</h2>
<li v-for="(item, i) in items" :key="item.id" v-reveal="{ preset: 'scale-in', shift: i * 8 }">{{ item.name }}</li>
<img v-parallax="40" src="hero.jpg" alt="" />
```

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useScrollProgress, useStory } from "@sweberdev/sigmoid-vue";

const stat = ref<HTMLElement | null>(null);
const progress = useScrollProgress(stat); // Ref<number>, 0 to 1

const how = ref<HTMLElement | null>(null);
const { step } = useStory(how, { steps: 3 }); // active step of a pinned section
</script>
```

**Docs and live demo:** [packages.sweber.dev/sigmoid/docs](https://packages.sweber.dev/sigmoid/docs)

MIT licensed.
