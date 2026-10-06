import { describe, expect, it } from "vitest";
import * as easing from "../src/easing";
import * as core from "../src/index";

// The public API of 1.x. Adding an export is a minor change and means adding it here;
// removing or renaming one is a major change and fails this test on purpose.
describe("public API", () => {
  it("exports exactly the documented functions", () => {
    expect(Object.keys(core).sort()).toEqual([
      "bezier",
      "cssVariables",
      "ease",
      "easing",
      "init",
      "logistic",
      "parallax",
      "parseRange",
      "prefersReducedMotion",
      "presets",
      "progress",
      "rangeBounds",
      "refresh",
      "reveal",
      "scrub",
      "splitText",
      "spring",
      "story",
      "supportsScrollTimeline",
      "toLinear",
      "track",
      "viewProgress",
    ]);
  });

  it("exports the easing entry point", () => {
    expect(Object.keys(easing).sort()).toEqual([
      "bezier",
      "cssVariables",
      "ease",
      "easing",
      "logistic",
      "spring",
      "toLinear",
    ]);
  });
});
