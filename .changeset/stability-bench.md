---
"@sweberdev/sigmoid": minor
"@sweberdev/sigmoid-react": minor
"@sweberdev/sigmoid-vue": minor
"@sweberdev/sigmoid-svelte": minor
---

Faster fallback, `refresh()`, API stability and a benchmark.

- The JavaScript fallback measures an element once and reuses the position until the layout changes (resize, an element changing size, the page getting taller or wider) and skips writes when nothing moved. With 300 elements the script time dropped from about 340 ms to about 70 ms for a full scroll.
- New `refresh()` measures everything again on the next frame, for changes that only move elements.
- Tests now check the export list of every package, so the public API is fixed for 1.x. New docs: stability and deprecation policy, benchmark against GSAP ScrollTrigger, Motion and AOS (`pnpm bench`, with the results in the docs), and migration guides from GSAP ScrollTrigger, AOS and Motion.
