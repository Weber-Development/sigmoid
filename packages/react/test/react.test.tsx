import { ease } from "@sweberdev/sigmoid";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Parallax, Reveal, ScrollProgress, useReducedMotion } from "../src/index";

let calls: {
  el: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  cancelled: boolean;
}[] = [];
let reduced = false;

beforeEach(() => {
  calls = [];
  reduced = false;
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
    matches: reduced && q.includes("reduce"),
    addEventListener() {},
    removeEventListener() {},
  })) as never;
});

afterEach(cleanup);

describe("components", () => {
  it("Reveal animates its element and cancels on unmount", () => {
    const { container, unmount } = render(
      <Reveal as="section" preset="scale-in" easing={ease.bouncy} className="card">
        Hello
      </Reveal>,
    );
    const el = container.querySelector("section.card");
    expect(el?.textContent).toBe("Hello");
    expect(calls[0]?.el).toBe(el);
    expect(calls[0]?.keyframes[0]).toEqual({ opacity: 0, transform: "scale(0.94)" });
    expect(calls[0]?.options.easing).toBe(ease.bouncy.css);
    unmount();
    expect(calls[0]?.cancelled).toBe(true);
  });

  it("does not restart on re-render with equal options", () => {
    const { rerender } = render(<Reveal preset="fade-in">a</Reveal>);
    rerender(<Reveal preset="fade-in">b</Reveal>);
    expect(calls).toHaveLength(1);
    rerender(<Reveal preset="blur-in">b</Reveal>);
    expect(calls).toHaveLength(2);
    expect(calls[0]?.cancelled).toBe(true);
  });

  it("Parallax and ScrollProgress start their animations", () => {
    render(
      <>
        <Parallax distance={30}>p</Parallax>
        <ScrollProgress className="bar" />
      </>,
    );
    expect(calls[0]?.keyframes[0]).toEqual({ transform: "translateY(30px)" });
    expect(calls[1]?.keyframes[1]).toEqual({ transform: "scaleX(1)" });
    expect(calls[1]?.el.getAttribute("aria-hidden")).toBe("true");
  });

  it("skips reveals with reduced motion", () => {
    reduced = true;
    render(<Reveal>x</Reveal>);
    expect(calls).toHaveLength(0);
  });
});

describe("useReducedMotion", () => {
  it("reads the media query", () => {
    reduced = true;
    let value: boolean | undefined;
    function Probe() {
      value = useReducedMotion();
      return null;
    }
    act(() => {
      render(<Probe />);
    });
    expect(value).toBe(true);
  });
});
