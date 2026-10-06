import { ease } from "@sweberdev/sigmoid";
import { beforeEach, describe, expect, it } from "vitest";
import { parallax, reveal, story, track } from "../src/index";

let calls: {
  el: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  cancelled: boolean;
}[] = [];

beforeEach(() => {
  calls = [];
  document.body.innerHTML = "";
  Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
  Element.prototype.animate = function (keyframes, options) {
    const call = {
      el: this,
      keyframes: keyframes as Keyframe[],
      options: options as KeyframeAnimationOptions,
      cancelled: false,
    };
    calls.push(call);
    return {
      currentTime: 0,
      pause() {},
      cancel() {
        call.cancelled = true;
      },
    } as unknown as Animation;
  };
  window.matchMedia = ((q: string) => ({
    matches: q === "never",
    addEventListener() {},
    removeEventListener() {},
  })) as never;
  window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  }) as never;
});

const node = () => {
  const el = document.createElement("div");
  document.body.append(el);
  return el;
};

describe("actions", () => {
  it("reveal animates the node and cancels on destroy", () => {
    const a = reveal(node(), "scale-in");
    expect(calls).toHaveLength(1);
    expect(calls[0]?.keyframes[0]?.transform).toBe("scale(0.94)");
    a.destroy();
    expect(calls[0]?.cancelled).toBe(true);
  });

  it("reveal restarts only when the parameters change by value", () => {
    const a = reveal(node(), { preset: "fade-in", shift: 0, easing: ease.bouncy });
    expect(calls[0]?.options.easing).toBe(ease.bouncy.css);
    a.update({ preset: "fade-in", shift: 0, easing: ease.bouncy });
    expect(calls).toHaveLength(1);
    a.update({ preset: "fade-in", shift: 16, easing: ease.bouncy });
    expect(calls).toHaveLength(2);
    expect(calls[0]?.cancelled).toBe(true);
  });

  it("parallax takes a distance", () => {
    parallax(node(), 40);
    expect(calls[0]?.keyframes[0]?.transform).toBe("translateY(40px)");
  });

  it("track and story report progress and the active step", () => {
    const seen: number[] = [];
    const steps: number[] = [];
    // jsdom has no layout: a 0px node at the top is past both ranges.
    track(node(), { onProgress: (p) => seen.push(p) });
    story(node(), { steps: 3, onStep: (s) => steps.push(s) });
    expect(seen).toEqual([1]);
    expect(steps).toEqual([2]);
  });
});
