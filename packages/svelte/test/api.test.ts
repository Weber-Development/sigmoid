import { describe, expect, it } from "vitest";
import * as svelte from "../src/index";

// The public API of 1.x: see packages/core/test/api.test.ts.
describe("public API", () => {
  it("exports exactly the documented actions", () => {
    expect(Object.keys(svelte).sort()).toEqual(["parallax", "reveal", "story", "track"]);
  });
});
