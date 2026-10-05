---
title: Reduced motion
description: How Sigmoid respects prefers-reduced-motion.
---

People with vestibular disorders can get dizzy or nauseous from motion they did not start, especially parallax and large movement. Operating systems have a setting for this, and browsers expose it as `prefers-reduced-motion: reduce` (WCAG 2.3.3, Animation from Interactions).

Sigmoid respects it by default:

| | With reduced motion |
|---|---|
| `data-sigmoid` presets and `parallax` | not animated, content is shown |
| `reveal`, `parallax`, `scrub` | no animation is created, `animations` is empty |
| `progress`, `data-sigmoid="progress"` | stays on: it only reflects the scroll position |

The presets animate from a hidden state to the element's own style, so skipping them always leaves the content visible.

To keep an animation that is essential, pass `reducedMotion: "allow"`, and prefer a calmer variant, e.g. a fade instead of movement:

```ts
const calm = prefersReducedMotion();
reveal(".chart", { keyframes: calm ? "fade-in" : "fade-up", reducedMotion: "allow" });
```

In React, `useReducedMotion()` updates when the setting changes.
