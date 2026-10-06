import { describe, expect, it } from "vitest";
import * as vue from "../src/index";

// The public API of 1.x: see packages/core/test/api.test.ts.
describe("public API", () => {
  it("exports exactly the documented directives and composables", () => {
    expect(Object.keys(vue).sort()).toEqual([
      "SigmoidPlugin",
      "useParallax",
      "useReducedMotion",
      "useReveal",
      "useScrollProgress",
      "useScrub",
      "useStory",
      "vParallax",
      "vReveal",
    ]);
  });
});
