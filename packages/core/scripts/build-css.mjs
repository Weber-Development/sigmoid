// Writes dist/sigmoid.css from the built easings and presets, so CSS and
// JavaScript always share the same curves and keyframes.
import { writeFileSync } from "node:fs";
import { cssVariables, ease, presets } from "../dist/index.js";

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const block = (frame) =>
  Object.entries(frame)
    .map(([k, v]) => `${kebab(k)}: ${v};`)
    .join(" ");

const keyframes = Object.entries(presets)
  .map(([name, [from, to]]) => {
    const end = Object.keys(to).length ? ` to { ${block(to)} }` : "";
    return `@keyframes sigmoid-${name} { from { ${block(from)} }${end} }`;
  })
  .join("\n");

const selectors = Object.keys(presets)
  .map((name) => `  [data-sigmoid="${name}"] { --sigmoid-keyframes: sigmoid-${name}; }`)
  .join("\n");

const css = `/* @sweberdev/sigmoid: scroll-driven motion without JavaScript.
   Elements animate natively where the browser supports CSS scroll timelines.
   Call init() from @sweberdev/sigmoid to cover the other browsers. */

:root {
${cssVariables()
  .split("\n")
  .map((l) => `  ${l}`)
  .join("\n")}
}

${keyframes}
@keyframes sigmoid-parallax {
  from { transform: translateY(calc(var(--sigmoid-parallax, 60) * 1px)); }
  to { transform: translateY(calc(var(--sigmoid-parallax, 60) * -1px)); }
}
@keyframes sigmoid-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-sigmoid] {
      animation: var(--sigmoid-keyframes, none) both;
      animation-timing-function: var(--sigmoid-easing, var(--sigmoid-ease-out));
      animation-timeline: view();
      /* --sigmoid-index staggers lists: each step starts --sigmoid-stagger later. */
      --sigmoid-shift: calc(var(--sigmoid-index, 0) * var(--sigmoid-stagger, 8%));
      animation-range: var(
        --sigmoid-range,
        entry var(--sigmoid-shift) cover calc(40% + var(--sigmoid-shift))
      );
    }
${selectors}
    [data-sigmoid="parallax"] {
      --sigmoid-keyframes: sigmoid-parallax;
      animation-timing-function: linear;
      animation-range: cover;
    }
  }
  [data-sigmoid="progress"] {
    transform-origin: 0 50%;
    animation: sigmoid-progress linear both;
    animation-timeline: scroll(root block);
  }
}
`;

writeFileSync(new URL("../dist/sigmoid.css", import.meta.url), css);
console.log(`dist/sigmoid.css: ${css.length} bytes`);

// Tailwind v4 theme: ease-bouncy, ease-sigmoid, … next to Tailwind's own
// ease-in, ease-out and ease-linear, which keep their meaning.
const { linear: _l, out: _o, inOut: _io, ...own } = ease;
const tailwind = `/* @sweberdev/sigmoid for Tailwind CSS v4: @import it after "tailwindcss".
   Adds ease-standard, ease-sigmoid, ease-smooth, ease-bouncy and ease-wobbly. */

@theme {
${cssVariables(own, "--ease-")
  .split("\n")
  .map((l) => `  ${l}`)
  .join("\n")}
}
`;
writeFileSync(new URL("../dist/tailwind.css", import.meta.url), tailwind);
console.log(`dist/tailwind.css: ${tailwind.length} bytes`);
