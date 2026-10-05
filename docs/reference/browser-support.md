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

`supportsScrollTimeline()` tells you which path runs. Every controller also has `native`.

## Server-side rendering

All functions return an empty controller when there is no `window`, so importing them in server code is safe. The CSS-only attributes need no JavaScript at all.
