---
title: Migrating
description: From GSAP ScrollTrigger, AOS and Motion to Sigmoid.
---

Sigmoid does one thing: it links animation to scroll position and gives you good easing curves. If that is what you use GSAP, AOS or Motion for, the mapping below covers most of it. If you also use their timelines, gestures or layout animations, keep those libraries for that part: the curves from Sigmoid work inside them (see [Easing](easing.md)).

## From GSAP ScrollTrigger

| GSAP | Sigmoid |
|---|---|
| `gsap.from(el, { opacity: 0, y: 24, scrollTrigger: { trigger: el, start: "top bottom", end: "top 60%", scrub: true } })` | `reveal(el, { keyframes: "fade-up" })`. The default range `entry 0% cover 40%` is close to that start and end. |
| `start` and `end` | `range`: `"entry 0% cover 40%"`, see [ranges](javascript.md#reveal). The named ranges replace the pixel and percent pairs. |
| `scrub: true` on the page | `scrub(targets, keyframes)` |
| `scrub` with `start: "20% top"`, `end: "80% top"` | `scrub(targets, keyframes, { range: [20, 80] })` |
| `onUpdate: (self) => self.progress` | `track(el, (progress) => …)` |
| `pin: true` | `data-sigmoid-pin` on the section (CSS `position: sticky`), and `story()` for steps |
| `toggleClass`, `onEnter`, `onLeave` | `track()` or `story()` with a callback, or CSS on `data-sigmoid-step` |
| `stagger: 0.1` | `stagger: 8` (percent of the range) or `--sigmoid-index` in CSS |
| `ease: "elastic.out"`, `"back.out"` | `ease.bouncy`, `ease.wobbly` or `spring({ bounce })` |
| `ScrollTrigger.refresh()` | `refresh()`. Sigmoid also measures again on resize and when the page changes size. |
| `ScrollTrigger.matchMedia`, `gsap.matchMedia` | CSS media queries on custom properties, or the standard `matchMedia` |
| `scroller: ".panel"` | nothing to do: the nearest scroll container is used |
| `horizontal` scrubbing | `axis: "inline"` |

Not covered: sequencing many tweens in one timeline, snapping to labels, `ScrollTrigger.batch`, scroll smoothing. Keep GSAP for those and use Sigmoid's curves inside it.

## From AOS

| AOS | Sigmoid |
|---|---|
| `data-aos="fade-up"` | `data-sigmoid="fade-up"` and `import "@sweberdev/sigmoid/sigmoid.css"` |
| `AOS.init()` | `init()` from `@sweberdev/sigmoid`: only needed for browsers without scroll timelines |
| `data-aos-delay="100"` | `style="--sigmoid-index: 1"`, shifts the range of each item |
| `data-aos-easing` | `style="--sigmoid-easing: var(--sigmoid-ease-bouncy)"` |
| `data-aos-offset`, `data-aos-anchor-placement` | `--sigmoid-range`, for example `entry 10% cover 50%` |
| `data-aos-once` | not needed: Sigmoid animations follow the scroll position and play backwards when you scroll up |

The biggest difference: AOS fires an animation once, at a time. Sigmoid links it to the scroll position. If you want a fixed-duration animation that starts when an element appears, use CSS with an `IntersectionObserver`, or keep AOS.

## From Motion (Framer Motion) in React

| Motion | Sigmoid |
|---|---|
| `<motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}>` | `<Reveal preset="fade-up">` |
| `viewport={{ once: true }}` | not needed, see AOS above |
| `useScroll({ target: ref })` and `scrollYProgress` | `useScrollProgress(ref)` |
| `useTransform(scrollYProgress, [0, 1], [0, 100])` | compute from the returned number, or use `useScrub(ref, keyframes)` |
| `transition={{ type: "spring", bounce: 0.3 }}` | `easing={spring({ bounce: 0.3 })}` or `ease.bouncy` |
| `useReducedMotion()` | `useReducedMotion()` |
| `useInView` | `useScrollProgress(ref)` and compare with 0 and 1 |

Motion's strengths, such as layout animations, gestures and `AnimatePresence`, are not part of Sigmoid. Both can live in one project, and the curves are shared:

```tsx
import { ease } from "@sweberdev/sigmoid";
<motion.div animate={{ x: 200 }} transition={{ ease: ease.bouncy, duration: ease.bouncy.duration! / 1000 }} />
```

## After the move

- Delete the old library when nothing uses it any more. Sigmoid with `init()` is about 3.1 kB, so the saving is real: see the [benchmark](../reference/benchmark.md).
- Check reduced motion. Sigmoid skips reveals and parallax for people who ask for it; if your old code did not, content that was hidden before is now just there.
