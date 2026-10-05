---
title: Why Sigmoid
description: Scroll motion on native CSS scroll timelines, with easing curves that actually feel physical.
---

Most scroll animations on the web are still driven by JavaScript: a scroll listener or an IntersectionObserver measures elements and updates styles on every frame. Browsers can now do this themselves. With **CSS scroll-driven animations** an animation follows the scroll position on the compositor, without any script running.

Sigmoid is a small layer on top of that platform feature:

- **Native first.** `reveal()`, `parallax()`, `scrub()` and `progress()` create Web Animations on a `ViewTimeline` or `ScrollTimeline`. The browser does the work.
- **Zero JavaScript if you want.** Add `sigmoid.css` and write `data-sigmoid="fade-up"`. Modern browsers animate it with CSS alone.
- **A fallback that stays small.** Where scroll timelines are missing, one passive scroll listener drives the same animations. It computes progress with the same range maths as the CSS spec, so both paths look the same.
- **Curves with character.** Springs, the logistic S-curve and Bézier curves as one `Easing` object: call it in JavaScript or use it in CSS as `linear()`. The springs are physically correct and also report their natural duration.
- **Reduced motion by default.** When the user asks the system for less motion, reveals and parallax are skipped and content is simply shown.
- **Small.** About 2.2 kB min+gzip for `reveal` + `init`, 3.6 kB for everything. A size check in CI keeps it that way.

## When to use something else

Sigmoid does scroll-linked motion and easing. It does not do layout animations, gestures, drag, SVG morphing or timelines with many steps. For those, [Motion](https://motion.dev) and [GSAP](https://gsap.com) are excellent. The easing curves of Sigmoid work with both of them, see [Easing](guides/easing.md).

## Name

The sigmoid function is the S-shaped curve that starts slowly, moves decisively and settles softly. It is the shape most good motion has, and it is available here as `ease.sigmoid`.
