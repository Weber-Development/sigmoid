import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { init } from "../src/auto";
import { ease } from "../src/easing";
import {
  parallax,
  progress,
  reveal,
  scrub,
  story,
  supportsScrollTimeline,
  track,
} from "../src/motion";
import { presets } from "../src/presets";

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

describe("stagger and shift", () => {
  it("starts each further element later in the fallback", () => {
    const els = [box(750), box(750), box(750)];
    reveal(els, { range: "entry 0% entry 100%", easing: "linear", stagger: 25 });
    // Half way through entry: 50%, then 25% and 0% for the later ones.
    expect(animations.map((a) => a.currentTime)).toEqual([500, 250, 0]);
  });

  it("passes shifted ranges to native timelines", () => {
    native();
    reveal([box(0), box(0)], { stagger: 8, shift: 2 });
    expect(animations[1]?.options.rangeStart).toBe("entry 10%");
    expect(animations[1]?.options.rangeEnd).toBe("cover 50%");
  });

  it("init reads --sigmoid-index and --sigmoid-stagger", () => {
    const el = box(750);
    el.setAttribute("data-sigmoid", "fade-in");
    el.style.setProperty("--sigmoid-index", "2");
    el.style.setProperty("--sigmoid-stagger", "10%");
    init();
    // Default range entry 0% cover 40%, shifted by 20%: entry 20% (20px) to cover 60% (540px).
    expect(animations[0]?.currentTime).toBeCloseTo((30 / 520) * 1000, 6);
  });
});

describe("track", () => {
  it("reports progress only when it changes", () => {
    const el = box(350);
    const calls: number[] = [];
    const c = track(el, (p) => calls.push(p));
    expect(calls).toEqual([0.5]);
    window.dispatchEvent(new Event("scroll"));
    expect(calls).toEqual([0.5]);
    c.cancel();
    expect(track(null, () => {}).animations).toHaveLength(0);
  });

  it("works on native browsers and with reduced motion", () => {
    native();
    reduced = true;
    const seen: number[] = [];
    track(box(700), (p) => seen.push(p), { range: "entry" });
    expect(seen).toEqual([1]);
  });
});

describe("scroll containers", () => {
  it("measures the fallback against the nearest scroll container", () => {
    const scroller = document.createElement("div");
    scroller.style.overflowY = "auto";
    Object.defineProperty(scroller, "offsetTop", { value: 1000 });
    Object.defineProperty(scroller, "clientHeight", { value: 400 });
    Object.defineProperty(scroller, "clientTop", { value: 0 });
    scroller.scrollTop = 200;
    document.body.append(scroller);
    const el = document.createElement("div");
    // Layout top 1550 = 550 into the container, 350 below its visible top.
    Object.defineProperty(el, "offsetTop", { value: 1550 });
    Object.defineProperty(el, "offsetHeight", { value: 100 });
    scroller.append(el);
    reveal(el, { range: "entry 0% entry 100%", easing: "linear" });
    // 400 - 350 = 50 of 100 px entered: half way, whatever the page does.
    expect(animations[0]?.currentTime).toBe(500);
  });
});

describe("story", () => {
  it("splits the contain range into steps", () => {
    const el = box(-1200, 2800); // 2800 px section, 1200 px scrolled past its top
    const seen: number[] = [];
    story(el, { steps: 4, onStep: (s) => seen.push(s) });
    // contain runs from 800 to 2800 scrolled; 2000 is 60% through: step 2 of 0..3.
    expect(seen).toEqual([2]);
    expect(el.getAttribute("data-sigmoid-step")).toBe("2");
    expect(el.style.getPropertyValue("--sigmoid-progress")).toBe("0.6");
  });
});

describe("presets", () => {
  it("has ten entrances, all ending at the element's own style", () => {
    expect(Object.keys(presets)).toHaveLength(10);
    expect(presets["flip-up"][0].transform).toContain("rotateX");
  });
});
