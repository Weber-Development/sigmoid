---
title: JavaScript API
description: reveal, parallax, scrub and progress with native timelines and a small fallback.
---

All functions accept an element, a CSS selector, a list of elements, or `null`. They return a controller:

```ts
interface Controller {
  animations: Animation[]; // the Web Animations, one per element
  native: boolean;         // true when a CSS scroll timeline drives them
  cancel(): void;          // stop and remove the effect
}
```

## reveal

```ts
reveal(".feature", {
  keyframes: "fade-up",          // preset name or your own Keyframe[]
  range: "entry 0% cover 40%",   // CSS animation-range on the view timeline
  easing: ease.bouncy,           // Sigmoid easing or any CSS easing
});
```

Own keyframes animate towards the element's own style when you leave the last one empty:

```ts
reveal("h2", { keyframes: [{ letterSpacing: "0.3em", opacity: 0 }, {}] });
```

Ranges: `cover`, `contain`, `entry`, `exit`, `entry-crossing`, `exit-crossing`, each with a percentage, e.g. `"entry 25% contain 50%"`. The [MDN page on animation-range](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range) explains them with diagrams.

### Stagger

Lists and grids look better when the items arrive one after another. `stagger` starts each further element later by that percentage of its range:

```ts
reveal(".team li", { keyframes: "fade-up", stagger: 8 });
```

`shift` moves the range of a single element, e.g. `shift: index * 8` when you call `reveal` per item.

## parallax

```ts
parallax(".hero img", { distance: 80 });
```

Moves the element from +80px to −80px while it crosses the viewport. Only `transform`, so no layout work.

## scrub

Links any keyframes to the scroll position of the page or a container (0 at the top, 1 at the bottom):

```ts
scrub(".sky", [{ backgroundColor: "#bde0fe" }, { backgroundColor: "#03045e" }]);
scrub(".gallery-track", [{ transform: "none" }, { transform: "translateX(-75%)" }], {
  source: document.querySelector(".gallery")!,
  axis: "inline",
});
```

## progress

```ts
progress("#reading-bar");
```

A `scrub` from `scaleX(0)` to `scaleX(1)` with the transform origin on the left. It stays on with reduced motion because it only moves when the user scrolls.

## track

For values CSS cannot animate, such as a counter, a video frame or a canvas, `track` reports the view progress (0 to 1) of each element whenever it changes:

```ts
track(".stat", (p, el) => {
  el.textContent = Math.round(p * 1200).toLocaleString();
}, { range: "entry 0% cover 50%" });
```

Progress of the whole page: `track(document.body, (p) => …, { range: "contain" })`. `track` always runs in JavaScript, one passive listener for all elements, and is not affected by reduced motion because it only reports a number.

## Fallback

Where `ViewTimeline` and `ScrollTimeline` are missing, Sigmoid creates the same Web Animation, pauses it and sets its time from the scroll position on each animation frame. One passive listener serves all elements. The range maths follow the CSS spec, so native and fallback look the same. The fallback measures elements relative to the page scroll; inside other scroll containers use `scrub` with `source`.

Pass `fallback: true` to force it, e.g. to compare both paths.
