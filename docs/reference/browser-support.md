---
title: Browser support
description: Where the native path runs and where the fallback takes over.
---

| Feature | Native in | Otherwise |
|---|---|---|
| Scroll-driven animations (`ViewTimeline`, `ScrollTimeline`) | Chrome and Edge 115, Safari 26 | JavaScript fallback with one passive scroll listener |
| CSS `linear()` easing | Chrome 113, Safari 17.2, Firefox 112 | curve applied in JavaScript (overshoot is clamped) |
| Web Animations API | all current browsers | required |

Check [caniuse.com/scroll-driven-animations](https://caniuse.com/mdn-css_properties_animation-timeline) for the current state in Firefox.

CI runs the same scroll scenarios in real Chromium, Firefox and WebKit on every change: on the page, inside a scroll container, on the inline axis, with scrub ranges, linked animations and counters. Chromium and WebKit use the native path (and the forced fallback for comparison), Firefox the fallback. Every path must give the same result.

`supportsScrollTimeline()` tells you which path runs. Every controller also has `native`.

## Edge cases

- **Right-to-left:** the inline axis starts at the right edge in `dir="rtl"` scrollers, in the native path and in the fallback. Covered by the real-browser tests.
- **`overflow: clip`:** it does not create a scroll container, so progress follows the next scroller up, like native view timelines. Covered by the real-browser tests.
- **`overflow: hidden`, `auto`, `scroll`:** these count as scroll containers.
- **iframes:** each document has its own scroll position. Load Sigmoid inside the frame; a script in the parent does not drive elements of the child.
- **CSS `zoom`:** elements inside a zoomed ancestor are measured on every frame instead of from cached layout, so progress stays correct in the fallback.

## Server-side rendering

All functions return an empty controller when there is no `window`, so importing them in server code is safe. The CSS-only attributes need no JavaScript at all.
