---
title: Benchmark
description: Size and scroll cost compared with GSAP ScrollTrigger, Motion and AOS.
---

The same effect, "fade-up cards while scrolling in", built with each library, in real Chromium. The script is in the repository (`bench/run.mjs`, run it with `pnpm bench`), so you can check the numbers on your own machine. They depend on the machine: compare the rows with each other, not with other machines.

<!-- bench:start -->
30 elements, 150 scroll steps, median of 5 runs:

| Library | Size (min+gzip) | JavaScript | Main-thread tasks | Style recalc |
|---|---|---|---|---|
| No library | 0.0 kB | 1.5 ms | 70.6 ms | 0 ms |
| Sigmoid (CSS only) | 0.0 kB | 1.4 ms | 155.8 ms | 32.8 ms |
| Sigmoid (native) | 2.3 kB | 1.3 ms | 142.2 ms | 30.7 ms |
| Sigmoid (fallback) | 2.3 kB | 27.2 ms | 143.2 ms | 34.6 ms |
| GSAP ScrollTrigger | 45.3 kB | 39.2 ms | 154 ms | 18.7 ms |
| Motion | 22.9 kB | 113.9 ms | 247 ms | 24.7 ms |
| AOS (fires once) | 5.4 kB | 8.1 ms | 77.1 ms | 0 ms |

300 elements, 150 scroll steps, median of 5 runs:

| Library | Size (min+gzip) | JavaScript | Main-thread tasks | Style recalc |
|---|---|---|---|---|
| No library | 0.0 kB | 1.5 ms | 96.8 ms | 0 ms |
| Sigmoid (CSS only) | 0.0 kB | 0.8 ms | 709.8 ms | 104.9 ms |
| Sigmoid (native) | 2.3 kB | 0.9 ms | 972 ms | 131.9 ms |
| Sigmoid (fallback) | 2.3 kB | 74.4 ms | 444 ms | 158.1 ms |
| GSAP ScrollTrigger | 45.3 kB | 61.2 ms | 376 ms | 74.2 ms |
| Motion | 22.9 kB | 731.1 ms | 1049.4 ms | 66 ms |
| AOS (fires once) | 5.4 kB | 16.8 ms | 114.6 ms | 0 ms |
<!-- bench:end -->

## How to read it

- **Size** is the minified and gzipped bundle of the snippet, without CSS. This is where Sigmoid is clearly smaller: the native path hands the work to the browser. "CSS only" needs no JavaScript at all.
- **JavaScript** is the script time while scrolling 150 steps. Sigmoid on a native timeline runs about 1 ms, because the browser drives the animation. The fallback is the same maths in JavaScript. GSAP ScrollTrigger and Motion run their code on every frame.
- **Main-thread tasks** include everything the main thread did: JavaScript, style recalculation and, in this headless Chromium without a GPU, painting. With 30 elements all libraries are close to each other. With 300 elements at the same time, Chromium updates every view timeline on the main thread and the native path costs more main-thread time than GSAP in this setup, even though almost none of it is JavaScript. Real devices with GPU compositing may differ.
- **AOS** fires an animation once and does not follow the scroll position, so it is not the same effect; it is in the table as a size reference.

What this means in practice: for the usual page, a few dozen animated elements, Sigmoid costs about as much main-thread time as GSAP and a fraction of the bytes. For very long lists with hundreds of elements animating at once, test on your target devices, and consider revealing only the elements that are close to the viewport.
