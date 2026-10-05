import { describe, expect, it } from "vitest";
import { parseRange, rangeBounds, viewProgress } from "../src/range";

describe("parseRange", () => {
  it("reads full and short forms", () => {
    expect(parseRange("entry 0% cover 40%")).toEqual({
      start: { name: "entry", offset: 0 },
      end: { name: "cover", offset: 40 },
    });
    expect(parseRange("cover")).toEqual({
      start: { name: "cover", offset: 0 },
      end: { name: "cover", offset: 100 },
    });
    expect(parseRange("entry 25%").end).toEqual({ name: "entry", offset: 100 });
    expect(parseRange("entry exit").end).toEqual({ name: "exit", offset: 100 });
  });

  it("rejects unknown ranges", () => {
    expect(() => parseRange("middle 10%")).toThrow(/unknown range/);
    expect(() => parseRange("")).toThrow(/unknown range/);
  });
});

describe("view timeline maths", () => {
  // 100px element in an 800px viewport.
  it("computes the named ranges like the spec", () => {
    expect(rangeBounds("cover", 100, 800)).toEqual([0, 900]);
    expect(rangeBounds("entry", 100, 800)).toEqual([0, 100]);
    expect(rangeBounds("contain", 100, 800)).toEqual([100, 800]);
    expect(rangeBounds("exit", 100, 800)).toEqual([800, 900]);
    // Taller than the viewport: contain runs while it fills the screen.
    expect(rangeBounds("contain", 1000, 800)).toEqual([800, 1000]);
  });

  it("maps the element position to progress", () => {
    const r = parseRange("entry 0% entry 100%");
    expect(viewProgress(r, 800, 100, 800)).toBe(0); // top at the bottom edge
    expect(viewProgress(r, 750, 100, 800)).toBe(0.5);
    expect(viewProgress(r, 700, 100, 800)).toBe(1);
    expect(viewProgress(r, 2000, 100, 800)).toBe(0);
    expect(viewProgress(parseRange("cover"), 350, 100, 800)).toBe(0.5);
  });
});
