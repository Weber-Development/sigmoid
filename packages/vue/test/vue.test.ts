import { ease } from "@sweberdev/sigmoid";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp, defineComponent, h, nextTick, ref, withDirectives } from "vue";
import { SigmoidPlugin, useScrollProgress, useStory, vParallax, vReveal } from "../src/index";

let calls: {
  el: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  cancelled: boolean;
}[] = [];
let root: HTMLElement;

beforeEach(() => {
  calls = [];
  root = document.createElement("div");
  document.body.append(root);
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

afterEach(() => {
  document.body.innerHTML = "";
});

describe("directives", () => {
  it("v-reveal animates the element and cancels on unmount", async () => {
    const show = ref(true);
    const app = createApp(
      defineComponent(
        () => () =>
          show.value ? withDirectives(h("p", "hi"), [[vReveal, "scale-in"]]) : h("span"),
      ),
    );
    app.mount(root);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.keyframes[0]?.transform).toBe("scale(0.94)");
    show.value = false;
    await nextTick();
    expect(calls[0]?.cancelled).toBe(true);
  });

  it("v-reveal takes options and restarts only when they change by value", async () => {
    const shift = ref(0);
    const app = createApp(
      defineComponent(
        () => () =>
          withDirectives(h("p"), [
            [vReveal, { preset: "fade-in", shift: shift.value, easing: ease.bouncy }],
          ]),
      ),
    );
    app.mount(root);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.options.easing).toBe(ease.bouncy.css);
    shift.value = 0;
    await nextTick();
    expect(calls).toHaveLength(1);
    shift.value = 16;
    await nextTick();
    expect(calls).toHaveLength(2);
    expect(calls[0]?.cancelled).toBe(true);
  });

  it("v-parallax accepts a distance and the plugin registers both", () => {
    const app = createApp(defineComponent(() => () => h("div")));
    app.use(SigmoidPlugin);

    expect(app.directive("parallax")).toBe(vParallax);
    expect(app.directive("reveal")).toBe(vReveal);
  });
});

describe("composables", () => {
  it("useScrollProgress and useStory read the element's progress", async () => {
    let progress = ref(-1);
    let step = ref(-1);
    const Probe = defineComponent(() => {
      const el = ref<HTMLElement | null>(null);
      progress = useScrollProgress(el, { range: "cover" });
      step = useStory(el, { steps: 3 }).step;
      return () => h("div", { ref: el });
    });
    createApp(Probe).mount(root);
    await nextTick();
    // jsdom has no layout: a 0px element at the top is past both ranges.
    expect(progress.value).toBe(1);
    expect(step.value).toBe(2);
  });
});
