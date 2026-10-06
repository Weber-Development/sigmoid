---
title: Recipes
description: Counters, reading progress, headers, carousels, text and image sequences.
---

Short, copyable answers to common scroll effects. All of them respect reduced motion where it makes sense.

## Counter that counts up

Without JavaScript, whole numbers:

```html
<span data-sigmoid="count" style="--sigmoid-count: 1200" role="img" aria-label="1200"></span>
```

With any format:

```ts
track(".stat", (p, el) => {
  el.textContent = `${(98.6 * p).toFixed(1)} %`;
}, { range: "entry 0% cover 50%" });
```

## Reading progress bar

```html
<div data-sigmoid="progress" class="reading-bar"></div>
```

```css
.reading-bar { position: fixed; inset: 0 0 auto; height: 3px; background: currentColor; }
```

## Header that shrinks on the first screens

```ts
scrub("header", [{ paddingBlock: "2rem" }, { paddingBlock: "0.75rem" }], {
  range: [0, 10], // done after the first 10% of the page
});
```

## Words that arrive one by one

```ts
const { elements, parent } = splitText("h1");
reveal(elements, { subject: parent, keyframes: "fade-up", stagger: 6 });
```

## Horizontal gallery

```ts
reveal(".slide", { axis: "inline", keyframes: "scale-in", stagger: 10 });
```

The slides must sit in a container with `overflow-x: auto`. Sigmoid measures against it, in the browser's native timeline and in the fallback.

## Scroll story with a pinned image

```html
<section id="how" style="height: 300vh">
  <div style="position: sticky; top: 0; height: 100vh"> … </div>
</section>
```

```ts
story("#how", { steps: 3, onStep: (i) => showStep(i) });
```

## Image sequence on a canvas

```ts
const frames = 120;
track("#sequence", (p) => {
  draw(images[Math.min(Math.floor(p * frames), frames - 1)]);
}, { range: "contain" });
```

## One easing everywhere

```css
@import "tailwindcss";
@import "@sweberdev/sigmoid/tailwind.css";
```

```html
<button class="transition-transform duration-500 ease-bouncy hover:scale-105">Buy</button>
```
