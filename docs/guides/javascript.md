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

### Horizontal scrolling

`axis: "inline"` makes `reveal`, `track` and `story` follow horizontal scrolling, for a carousel or a horizontal gallery. The element is measured against its nearest horizontal scroll container, like CSS `view(inline)` does:

```ts
reveal(".slide", { axis: "inline", keyframes: "scale-in" });
```

Right-to-left layouts are not covered yet.

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

### Part of the scroll distance

`range: [from, to]` runs the animation over a part of the scroll distance, in percent. Below, the sky changes colour only between a quarter and three quarters of the page:

```ts
scrub(".sky", [{ backgroundColor: "#bde0fe" }, { backgroundColor: "#03045e" }], {
  range: [25, 75],
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

## Linked animations

One element can drive the animation of others, for example a tall stage that fades in a caption somewhere else. Pass the driving element as `subject`:

```ts
reveal(".caption", { subject: document.querySelector("#stage")!, keyframes: "fade-up", range: "cover 10% cover 40%" });
```

The same in markup, started by `init()` in every browser (the browser still drives it natively, because `init()` creates the view timeline in JavaScript):

```html
<div id="stage" data-sigmoid-timeline="stage" style="height: 120vh">…</div>
<p data-sigmoid-follow="stage" data-sigmoid-preset="fade-up">Caption</p>
```

A follower takes `--sigmoid-range`, `--sigmoid-easing`, `--sigmoid-index` and `--sigmoid-stagger` like other elements. The default range is `cover 0% cover 40%` of the stage.

## splitText

Splits the text of an element into words or characters so they can arrive one after another:

```ts
const { elements, parent, revert } = splitText("h1"); // or { by: "chars" }
reveal(elements, { subject: parent, keyframes: "fade-up", stagger: 6 });
```

`subject` makes the whole headline drive every word, so all words animate while the headline crosses the window, one after another, not each at its own scroll position. `splitText` handles plain text: markup inside the element is replaced, and `revert()` puts it back. Screen readers still read the original text; the pieces are hidden from them with `aria-hidden`.

## story

A scroll story is a tall section whose content stays pinned while the reader scrolls through a few steps. CSS does the pinning with `position: sticky`; `story` tells you which step is active:

```html
<section id="how" style="height: 300vh">
  <div style="position: sticky; top: 0; height: 100vh">
    <p class="step">One</p><p class="step">Two</p><p class="step">Three</p>
  </div>
</section>
```

```ts
story("#how", {
  steps: 3,
  onStep: (i) => console.log("step", i), // 0, 1, 2
});
```

`story` sets `data-sigmoid-step` and `--sigmoid-progress` (0 to 1) on the section, so CSS alone can react, e.g. `#how[data-sigmoid-step="1"] .step:nth-child(2) { opacity: 1 }`. The default range is `contain`: for a section taller than the window, exactly the time its sticky content is pinned.

## Fallback

Where `ViewTimeline` and `ScrollTimeline` are missing, Sigmoid creates the same Web Animation, pauses it and sets its time from the scroll position on each animation frame. One passive listener serves all elements. The range maths follow the CSS spec, so native and fallback look the same. Like `view()`, the fallback measures each element against its nearest scroll container, so reveals inside a scrolling panel or a carousel work the same as on the page.

Pass `fallback: true` to force it, e.g. to compare both paths.
