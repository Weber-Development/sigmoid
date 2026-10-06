---
title: API
description: Every export of @sweberdev/sigmoid and @sweberdev/sigmoid-react.
---

## @sweberdev/sigmoid

| Export | Signature |
|---|---|
| `reveal` | `(targets, { keyframes?, range?, stagger?, shift?, axis?, subject?, easing?, reducedMotion?, fallback? }) => Controller` |
| `track` | `(targets, (progress, element) => void, { range?, axis? }) => Controller` |
| `story` | `(targets, { steps, onStep?, range?, axis? }) => Controller`: sets `data-sigmoid-step` and `--sigmoid-progress` |
| `parallax` | `(targets, { distance?, easing?, reducedMotion?, fallback? }) => Controller` |
| `scrub` | `(targets, keyframes, { source?, axis?, range?, easing?, reducedMotion?, fallback? }) => Controller` |
| `splitText` | `(target, { by?: "words" \| "chars" }) => { elements, parent, revert() }` |
| `progress` | `(targets, { source?, axis? }) => Controller` |
| `init` | `(root = document, { force? }) => stop()`: starts the fallback for `data-sigmoid`, and linked animations (`data-sigmoid-follow`) in every browser |
| `refresh` | `() => void`: measures every fallback element again on the next frame. Needed only after moving elements without resizing anything |
| `supportsScrollTimeline` | `() => boolean` |
| `prefersReducedMotion` | `() => boolean` |
| `presets` | the keyframes behind the preset names |
| `Axis` | `"block" \| "inline"` |
| `parseRange`, `rangeBounds`, `viewProgress` | the view-timeline maths of the fallback |

`targets` is an `Element`, a selector, an iterable of elements, `null` or `undefined`. `reducedMotion` is `"skip"` (default) or `"allow"`.

## @sweberdev/sigmoid/easing

Also exported from the main entry.

| Export | Signature |
|---|---|
| `spring` | `({ duration?, bounce?, stiffness?, damping?, mass?, velocity? }) => Easing` |
| `logistic` | `(steepness = 10) => Easing` |
| `bezier` | `(x1, y1, x2, y2) => Easing` |
| `easing` | `(fn, css?, duration?) => Easing` |
| `toLinear` | `(fn, { samples?, tolerance? }) => string` |
| `ease` | `out`, `inOut`, `standard`, `sigmoid`, `smooth`, `bouncy`, `wobbly`, `linear` |
| `cssVariables` | `(easings = ease, prefix = "--sigmoid-ease-") => string` |

```ts
interface Easing {
  (t: number): number;
  readonly css: string;
  readonly duration?: number; // ms, springs only
}
```

## @sweberdev/sigmoid/sigmoid.css

`data-sigmoid` presets, `--sigmoid-*` custom properties and the `--sigmoid-ease-*` variables. See [CSS only](../guides/css.md).

## @sweberdev/sigmoid/tailwind.css

A Tailwind CSS v4 `@theme` with `--ease-standard`, `--ease-sigmoid`, `--ease-smooth`, `--ease-bouncy` and `--ease-wobbly`. See [Easing](../guides/easing.md#tailwind-css).

## @sweberdev/sigmoid-svelte

Actions, imported by their plain names: `use:reveal`, `use:parallax`, `use:track`, `use:story`.

| Action | Parameter |
|---|---|
| `reveal` | a preset name or `{ preset?, keyframes?, range?, easing?, shift?, stagger?, axis?, subject?, reducedMotion? }` |
| `parallax` | a distance in pixels or `ParallaxOptions` |
| `track` | `{ onProgress(progress), range?, axis? }` |
| `story` | `{ steps, onStep?(step), range?, axis? }` |

## @sweberdev/sigmoid-react

| Export | Props / signature |
|---|---|
| `Reveal` | `as?`, `preset?`, `range?`, `shift?`, `easing?`, `reducedMotion?` and the props of the element |
| `Parallax` | `as?`, `distance?`, `reducedMotion?` |
| `ScrollProgress` | `source?: RefObject<Element>` and `div` props |
| `useReveal` | `(ref, RevealOptions)` |
| `useParallax` | `(ref, ParallaxOptions)` |
| `useScrub` | `(ref, keyframes, ScrubOptions)` |
| `useScrollProgress` | `(ref, { range?, axis? }) => number` |
| `useStory` | `(ref, { steps, range?, axis? }) => { step }` |
| `useReducedMotion` | `() => boolean` |

## @sweberdev/sigmoid-vue

| Export | Signature |
|---|---|
| `vReveal` | directive, value is a preset name or `{ preset?, keyframes?, range?, easing?, shift?, stagger?, reducedMotion? }` |
| `vParallax` | directive, value is a distance in pixels or `ParallaxOptions` |
| `SigmoidPlugin` | `app.use(SigmoidPlugin)` registers `v-reveal` and `v-parallax` |
| `useReveal` | `(ref, RevealOptions)` |
| `useParallax` | `(ref, ParallaxOptions)` |
| `useScrub` | `(ref, keyframes, ScrubOptions)` |
| `useScrollProgress` | `(ref, { range?, axis? }) => Ref<number>` |
| `useStory` | `(ref, { steps, range?, axis? }) => { step: Ref<number> }` |
| `useReducedMotion` | `() => Ref<boolean>` |
