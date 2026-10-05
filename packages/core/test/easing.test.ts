import { describe, expect, it } from "vitest";
import { bezier, cssVariables, ease, easing, logistic, spring, toLinear } from "../src/easing";

/** Evaluates a CSS linear() value the way the browser does. */
function evalLinear(css: string, x: number): number {
  const body = css.slice("linear(".length, -1);
  const stops = body.split(",").map((s, i, all) => {
    const [v, p] = s.trim().split(/\s+/);
    const pos = p
      ? Number.parseFloat(p) / 100
      : i === 0
        ? 0
        : i === all.length - 1
          ? 1
          : Number.NaN;
    return [pos, Number(v)] as const;
  });
  for (let i = 1; i < stops.length; i++) {
    const [x0, y0] = stops[i - 1] as readonly [number, number];
    const [x1, y1] = stops[i] as readonly [number, number];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
  }
  return stops[stops.length - 1]?.[1] ?? 1;
}

describe("spring", () => {
  it("runs from 0 to 1 and reports its duration", () => {
    const s = spring({ duration: 0.5 });
    expect(s(0)).toBe(0);
    expect(s(1)).toBe(1);
    expect(s.duration).toBeGreaterThan(400);
    expect(s.duration).toBeLessThan(2000);
  });

  it("does not overshoot without bounce and overshoots with it", () => {
    const smooth = spring({ bounce: 0 });
    const bouncy = spring({ bounce: 0.4 });
    let maxSmooth = 0;
    let maxBouncy = 0;
    for (let i = 0; i <= 100; i++) {
      maxSmooth = Math.max(maxSmooth, smooth(i / 100));
      maxBouncy = Math.max(maxBouncy, bouncy(i / 100));
    }
    expect(maxSmooth).toBeLessThanOrEqual(1);
    expect(maxBouncy).toBeGreaterThan(1.05);
  });

  it("accepts physical parameters, including overdamped springs", () => {
    const s = spring({ stiffness: 100, damping: 40, mass: 1 });
    expect(s(0.5)).toBeGreaterThan(0);
    expect(s(0.5)).toBeLessThan(1);
    expect(s(1)).toBe(1);
  });

  it("starts faster with initial velocity", () => {
    expect(spring({ velocity: 10 })(0.05)).toBeGreaterThan(spring()(0.05));
  });
});

describe("bezier", () => {
  it("matches the CSS ease keyword", () => {
    const e = bezier(0.25, 0.1, 0.25, 1);
    expect(e(0.5)).toBeCloseTo(0.8024, 3);
    expect(e.css).toBe("cubic-bezier(0.25, 0.1, 0.25, 1)");
    expect(String(e)).toBe(e.css);
  });
});

describe("logistic", () => {
  it("is a symmetric S-curve from 0 to 1", () => {
    const s = logistic(10);
    expect(s(0)).toBeCloseTo(0, 6);
    expect(s(1)).toBeCloseTo(1, 6);
    expect(s(0.5)).toBeCloseTo(0.5, 6);
    expect(s(0.25) + s(0.75)).toBeCloseTo(1, 6);
  });
});

describe("toLinear", () => {
  it("stays within tolerance of the real curve with few points", () => {
    for (const e of [ease.sigmoid, ease.smooth, ease.bouncy, ease.wobbly]) {
      const stops = e.css.split(",").length;
      expect(stops).toBeLessThan(50);
      for (let i = 0; i <= 200; i++) {
        const x = i / 200;
        expect(Math.abs(evalLinear(e.css, x) - e(x))).toBeLessThan(0.004);
      }
    }
  });

  it("keeps a straight line to two points", () => {
    expect(toLinear((t) => t)).toBe("linear(0, 1)");
  });

  it("clamps the input of wrapped functions", () => {
    const e = easing((t) => t * 2);
    expect(e(-1)).toBe(0);
    expect(e(5)).toBe(2);
  });
});

describe("cssVariables", () => {
  it("writes one kebab-case custom property per easing", () => {
    const css = cssVariables();
    expect(css).toContain("--sigmoid-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);");
    expect(css).toMatch(/--sigmoid-ease-bouncy: linear\(0, .*, 1\);/);
    expect(cssVariables({ a: ease.out }, "--x-")).toBe("--x-a: cubic-bezier(0.16, 1, 0.3, 1);");
  });
});
