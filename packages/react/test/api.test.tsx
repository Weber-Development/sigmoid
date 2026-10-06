import { describe, expect, it } from "vitest";
import * as react from "../src/index";

// The public API of 1.x: see packages/core/test/api.test.ts.
describe("public API", () => {
  it("exports exactly the documented components and hooks", () => {
    expect(Object.keys(react).sort()).toEqual([
      "Parallax",
      "Reveal",
      "ScrollProgress",
      "useParallax",
      "useReducedMotion",
      "useReveal",
      "useScrollProgress",
      "useScrub",
      "useStory",
    ]);
  });
});
