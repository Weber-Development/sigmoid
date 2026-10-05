// Writes dist/sigmoid.css from the built easings and presets, so CSS and
// JavaScript always share the same curves and keyframes.
import { writeFileSync } from "node:fs";
import { cssVariables, presets } from "../dist/index.js";

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
      animation-range: var(--sigmoid-range, entry 0% cover 40%);
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
