---
title: CSS only
description: data-sigmoid attributes, custom properties and the easing variables.
---

`@sweberdev/sigmoid/sigmoid.css` (about 4 kB, uncompressed) animates elements with a `data-sigmoid` attribute. Inside `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`, so other browsers and users who prefer less motion see the content without animation.

## Presets

| Value | Effect |
|---|---|
| `fade-in` | opacity |
| `fade-up`, `fade-down` | opacity and vertical movement |
| `slide-left`, `slide-right` | opacity and horizontal movement |
| `scale-in` | opacity and scale from 94% |
| `blur-in` | opacity and blur |
| `clip-up` | revealed from the bottom with `clip-path` |
| `rotate-in` | opacity, a slight turn and scale |
| `flip-up` | opacity and a 3D tilt towards the reader |
| `parallax` | moves against the scroll direction while crossing the viewport |
| `progress` | scales from 0 to 100% width with the page scroll, e.g. a reading bar |
| `count` | a number that counts up to `--sigmoid-count` |

## Tuning with custom properties

```html
<li data-sigmoid="fade-up"
    style="--sigmoid-range: entry 10% cover 50%;
           --sigmoid-easing: var(--sigmoid-ease-bouncy);
           --sigmoid-distance: 48px">
```

| Property | Default | Meaning |
|---|---|---|
| `--sigmoid-range` | `entry 0% cover 40%` | CSS `animation-range` on the element's view timeline |
| `--sigmoid-easing` | `var(--sigmoid-ease-out)` | any CSS easing |
| `--sigmoid-distance` | `24px` | movement of the `fade-*` and `slide-*` presets |
| `--sigmoid-parallax` | `60` | pixels for `parallax`, without unit |
| `--sigmoid-index` | `0` | position in a list, for staggering |
| `--sigmoid-stagger` | `8%` | how much later each index starts (with `%`) |

### Counting numbers

```html
<span data-sigmoid="count" style="--sigmoid-count: 1200" role="img" aria-label="1200"></span>
```

The element shows its number through CSS, so it stays empty in the markup: give it a `role="img"` and an `aria-label` with the end value for screen readers. Counting uses a registered custom property and works with whole numbers only. Without scroll timelines and without `init()` it shows the end value. For other formats, such as `1,200` or `98.6%`, use `track()`.

### Horizontal scrolling

```html
<li data-sigmoid="fade-up" data-sigmoid-axis="inline">…</li>
```

`data-sigmoid-axis="inline"` follows the nearest horizontal scroll container.

### Pinned sections

```html
<section data-sigmoid-pin style="--sigmoid-pin-length: 300vh">
  <div> … stays in view while you scroll through the section … </div>
</section>
```

`data-sigmoid-pin` makes the section tall (`--sigmoid-pin-length`, default `300vh`) and keeps its first child in view with `position: sticky`. Add `story()` from the JavaScript API when the content should change in steps.

### Staggered lists

```html
<ul>
  <li data-sigmoid="fade-up" style="--sigmoid-index: 0">…</li>
  <li data-sigmoid="fade-up" style="--sigmoid-index: 1">…</li>
  <li data-sigmoid="fade-up" style="--sigmoid-index: 2">…</li>
</ul>
```

The index shifts the default range. When you set your own `--sigmoid-range`, the index is ignored.

`init()` reads the same properties for the JavaScript fallback.

## Easing variables

The stylesheet defines every curve of `ease` on `:root`, so you can use them anywhere, also for transitions:

```css
.button { transition: transform 0.4s var(--sigmoid-ease-bouncy); }
```

`--sigmoid-ease-linear`, `-out`, `-in-out`, `-standard`, `-sigmoid`, `-smooth`, `-bouncy`, `-wobbly`.

With Tailwind CSS 4: `ease-(--sigmoid-ease-bouncy)`, or register them in `@theme` as `--ease-bouncy: var(--sigmoid-ease-bouncy)`.
