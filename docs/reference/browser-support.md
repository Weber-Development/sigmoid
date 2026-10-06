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

## Server-side rendering

All functions return an empty controller when there is no `window`, so importing them in server code is safe. The CSS-only attributes need no JavaScript at all.
