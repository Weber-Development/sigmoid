import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { init } from "../src/auto";
import { ease } from "../src/easing";
import { parallax, progress, reveal, scrub, supportsScrollTimeline } from "../src/motion";

class FakeAnimation {
  currentTime: number | null = 0;
  cancelled = false;
  constructor(
    public keyframes: Keyframe[],
    public options: KeyframeAnimationOptions & Record<string, unknown>,
  ) {}
  pause() {}
  cancel() {
    this.cancelled = true;
  }
}

let animations: FakeAnimation[] = [];
let reduced = false;

beforeEach(() => {
  animations = [];
  reduced = false;
  document.body.innerHTML = "";
  Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
  Element.prototype.animate = (keyframes, options) => {
    const a = new FakeAnimation(keyframes as Keyframe[], options as never);
    animations.push(a);
    return a as unknown as Animation;
  };
  window.matchMedia = ((q: string) => ({
    matches: reduced && q.includes("reduce"),
    addEventListener() {},
    removeEventListener() {},
  })) as never;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  // biome-ignore lint/suspicious/noExplicitAny: test cleanup of browser globals
  delete (window as any).ViewTimeline;
  // biome-ignore lint/suspicious/noExplicitAny: test cleanup of browser globals
  delete (window as any).ScrollTimeline;
});

function box(top: number, height = 100) {
  const el = document.createElement("div");
  Object.defineProperty(el, "offsetTop", { value: top });
  Object.defineProperty(el, "offsetHeight", { value: height });
  document.body.append(el);
  return el;
}

function native() {
  class Timeline {
    constructor(public options: unknown) {}
  }
  vi.stubGlobal("ViewTimeline", Timeline);
  vi.stubGlobal("ScrollTimeline", Timeline);
  Object.assign(window, { ViewTimeline: Timeline, ScrollTimeline: Timeline });
}

describe("reveal", () => {
  it("drives the fallback from the scroll position", () => {
    const el = box(750);
    const c = reveal(el, { range: "entry 0% entry 100%", easing: "linear" });
    expect(c.native).toBe(false);
    expect(animations[0]?.currentTime).toBe(500);
    expect(animations[0]?.options.easing).toBe("linear");
    c.cancel();
    expect(animations[0]?.cancelled).toBe(true);
  });

  it("uses a native view timeline and the CSS range when available", () => {
    native();
    expect(supportsScrollTimeline()).toBe(true);
    const c = reveal(box(2000), { easing: ease.bouncy });
    expect(c.native).toBe(true);
    const o = animations[0]?.options ?? {};
    expect(o.timeline).toBeDefined();
    expect(o.rangeStart).toBe("entry 0%");
    expect(o.rangeEnd).toBe("cover 40%");
    expect(o.easing).toBe(ease.bouncy.css);
  });

  it("can be forced into the fallback", () => {
    native();
    expect(reveal(box(0), { fallback: true }).native).toBe(false);
  });

  it("does nothing with reduced motion unless allowed", () => {
    reduced = true;
    expect(reveal(box(0)).animations).toHaveLength(0);
    expect(reveal(box(0), { reducedMotion: "allow" }).animations).toHaveLength(1);
  });

  it("accepts selectors, lists and missing targets", () => {
    box(0).className = "a";
    box(0).className = "a";
    expect(reveal(".a").animations).toHaveLength(2);
    expect(reveal(null).animations).toHaveLength(0);
  });
});

describe("parallax, scrub and progress", () => {
  it("parallax moves against the scroll", () => {
    parallax(box(350), { distance: 40 });
    const a = animations[0];
    expect(a?.keyframes[0]?.transform).toBe("translateY(40px)");
    expect(a?.currentTime).toBe(500); // half way through "cover"
  });

  it("scrub follows the page scroll", () => {
    const root = document.documentElement;
    Object.defineProperty(root, "scrollHeight", { value: 2800, configurable: true });
    Object.defineProperty(root, "clientHeight", { value: 800, configurable: true });
    root.scrollTop = 500;
    scrub(box(0), [{ opacity: 0 }, { opacity: 1 }], { source: root });
    expect(animations[0]?.currentTime).toBe(250);
  });

  it("progress stays on with reduced motion", () => {
    reduced = true;
    const el = box(0);
    expect(progress(el).animations).toHaveLength(1);
    expect(el.style.transformOrigin).toBe("0 50%");
  });
});

describe("init", () => {
  it("does nothing where CSS handles data-sigmoid natively", () => {
    native();
    box(0).setAttribute("data-sigmoid", "fade-up");
    init();
    expect(animations).toHaveLength(0);
  });

  it("starts the fallback for each data-sigmoid element", () => {
    const a = box(750);
    a.setAttribute("data-sigmoid", "scale-in");
    a.style.setProperty("--sigmoid-range", "entry 0% entry 100%");
    box(0).setAttribute("data-sigmoid", "parallax");
    box(0).setAttribute("data-sigmoid", "progress");
    box(0).setAttribute("data-sigmoid", "unknown");
    const stop = init();
    expect(animations).toHaveLength(3);
    expect(animations[0]?.keyframes[0]).toEqual({ opacity: 0, transform: "scale(0.94)" });
    expect(animations[0]?.currentTime).toBe(500);
    stop();
    expect(animations.every((x) => x.cancelled)).toBe(true);
  });
});
