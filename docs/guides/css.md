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
| `parallax` | moves against the scroll direction while crossing the viewport |
| `progress` | scales from 0 to 100% width with the page scroll, e.g. a reading bar |

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

`init()` reads the same properties for the JavaScript fallback.

## Easing variables

The stylesheet defines every curve of `ease` on `:root`, so you can use them anywhere, also for transitions:

```css
.button { transition: transform 0.4s var(--sigmoid-ease-bouncy); }
```

`--sigmoid-ease-linear`, `-out`, `-in-out`, `-standard`, `-sigmoid`, `-smooth`, `-bouncy`, `-wobbly`.

With Tailwind CSS 4: `ease-(--sigmoid-ease-bouncy)`, or register them in `@theme` as `--ease-bouncy: var(--sigmoid-ease-bouncy)`.
