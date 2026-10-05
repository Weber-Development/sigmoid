---
title: Easing curves
description: Springs, the logistic S-curve and Bézier curves for JavaScript and CSS.
---

Every curve is an `Easing`: a function from 0..1 to progress, with a `css` property. `String(easing)` returns the CSS value, so it fits into template strings.

```ts
import { spring } from "@sweberdev/sigmoid/easing";

const pop = spring({ duration: 0.5, bounce: 0.3 });

pop(0.5);        // 1.037, past the target
pop.css;         // "linear(0, 0.0009 0.42%, …, 1)"
pop.duration;    // 819: natural duration in ms until it rests
el.style.transition = `transform ${pop.duration}ms ${pop}`;
```

`@sweberdev/sigmoid/easing` contains only the curves (about 1.3 kB), for projects that use another animation library.

## Presets

| Name | Curve |
|---|---|
| `ease.out` | `cubic-bezier(0.16, 1, 0.3, 1)`, fast start and long landing; the default for reveals |
| `ease.inOut` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `ease.standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `ease.sigmoid` | logistic S-curve, steepness 10 |
| `ease.smooth` | spring without overshoot (perceived 0.5 s) |
| `ease.bouncy` | spring with light overshoot (perceived 0.6 s) |
| `ease.wobbly` | spring with a clear wobble (perceived 0.8 s) |
| `ease.linear` | `linear` |

## spring

```ts
spring({ duration: 0.6, bounce: 0.3 });               // perceptual, like SwiftUI
spring({ stiffness: 170, damping: 26, mass: 1 });     // physical
spring({ duration: 0.4, velocity: 4 });               // start with speed
```

The spring is solved analytically (under-, critically and overdamped) and ends when it stays within 0.1% of the target. In a scroll-driven animation the scroll range sets the length, the curve keeps its shape.

## logistic

```ts
logistic(6);   // soft S
logistic(14);  // sharp S
```

Normalised so that it starts exactly at 0 and ends exactly at 1.

## bezier, easing and toLinear

```ts
bezier(0.34, 1.56, 0.64, 1);               // same as cubic-bezier() in CSS
easing((t) => 1 - (1 - t) ** 4);           // any function, CSS generated
toLinear((t) => t * t, { tolerance: 0.001 }); // just the linear() string
```

`toLinear` samples the curve and removes every point that does not change the result by more than the tolerance (default 0.0015), so a spring needs 20 to 40 stops instead of hundreds. CSS `linear()` works in Chrome 113, Safari 17.2 and Firefox 112 and newer. Older browsers get the curve applied in JavaScript.

## With Motion or GSAP

```ts
import { animate } from "motion";
animate(".box", { x: 200 }, { ease: ease.bouncy, duration: ease.bouncy.duration! / 1000 });

gsap.to(".box", { x: 200, ease: ease.wobbly, duration: 0.8 });
```

## Custom CSS variables

```ts
import { cssVariables, spring } from "@sweberdev/sigmoid/easing";

const css = `:root { ${cssVariables({ brand: spring({ bounce: 0.2 }) }, "--ease-")} }`;
// :root { --ease-brand: linear(…); }
```
