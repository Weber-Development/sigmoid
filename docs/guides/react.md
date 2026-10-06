---
title: React
description: Reveal, Parallax, ScrollProgress and hooks.
---

```sh
pnpm add @sweberdev/sigmoid-react
```

The components are client components (`"use client"`), render one element and pass all other props through. They work with the App Router and Server Components as children.

## Reveal

```tsx
import { ease } from "@sweberdev/sigmoid";
import { Reveal } from "@sweberdev/sigmoid-react";

<Reveal as="li" preset="fade-up" range="entry 0% cover 30%" easing={ease.bouncy}>
  …
</Reveal>
```

`preset` takes a preset name or your own keyframes. In a list, `shift` staggers the items:

```tsx
{items.map((item, i) => (
  <Reveal key={item.id} as="li" preset="fade-up" shift={i * 8}>…</Reveal>
))}
```

## Parallax

```tsx
<Parallax as="figure" distance={80}>
  <Image src={hero} alt="" />
</Parallax>
```

## ScrollProgress

```tsx
<ScrollProgress className="fixed inset-x-0 top-0 z-50 h-1 bg-black" />
```

Unstyled apart from the scale, `aria-hidden` because it is decoration. Pass `source={ref}` to follow a scroll container.

## Hooks

```tsx
const ref = useRef<HTMLDivElement>(null);
useReveal(ref, { keyframes: "blur-in" });
useParallax(ref, { distance: 40 });
useScrub(ref, [{ opacity: 1 }, { opacity: 0 }]);
const reduced = useReducedMotion();
const progress = useScrollProgress(ref, { range: "cover" }); // 0 to 1, re-renders on change
const { step } = useStory(ref, { steps: 3 }); // scroll story, re-renders when the step changes
```

The animation restarts only when the options change by value, not on every render.

## Zero JavaScript in React

You can also use the attributes from [CSS only](css.md) directly: `<h2 data-sigmoid="fade-up">`. They work in Server Components without any client code.
