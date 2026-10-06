import {
  type Controller,
  type Easing,
  type ParallaxOptions,
  parallax,
  prefersReducedMotion,
  type RevealOptions,
  reveal,
  type ScrubOptions,
  scrub,
  story,
  type TrackOptions,
  track,
} from "@sweberdev/sigmoid";
import {
  type App,
  type Directive,
  onBeforeUnmount,
  onMounted,
  type Ref,
  ref,
  unref,
  watch,
} from "vue";

type MaybeRef<T> = T | Ref<T>;
type Target = Ref<Element | null | undefined>;

const keyOf = (o: unknown) =>
  JSON.stringify(o, (_k, v) => (typeof v === "function" ? (v as Easing).css : v));

/** Runs a Sigmoid animation on a template ref and restarts it when the options change. */
function useMotion(target: Target, options: MaybeRef<object>, start: (el: Element) => Controller) {
  let controller: Controller | undefined;
  const stop = () => {
    controller?.cancel();
    controller = undefined;
  };
  const begin = () => {
    stop();
    if (target.value) controller = start(target.value);
  };
  onMounted(begin);
  watch(() => [target.value, keyOf(unref(options))], begin);
  onBeforeUnmount(stop);
}

/** Reveals the referenced element as it scrolls into view. */
export function useReveal(target: Target, options: MaybeRef<RevealOptions> = {}) {
  useMotion(target, options, (el) => reveal(el, unref(options)));
}

/** Moves the referenced element against the scroll direction. */
export function useParallax(target: Target, options: MaybeRef<ParallaxOptions> = {}) {
  useMotion(target, options, (el) => parallax(el, unref(options)));
}

/** Links keyframes to the scroll position of the page or a container. */
export function useScrub(
  target: Target,
  keyframes: Keyframe[],
  options: MaybeRef<ScrubOptions> = {},
) {
  useMotion(target, [keyframes, unref(options)], (el) => scrub(el, keyframes, unref(options)));
}

/** The view progress (0 to 1) of the referenced element, for counters and canvas. */
export function useScrollProgress(target: Target, options: TrackOptions = {}): Ref<number> {
  const value = ref(0);
  let controller: Controller | undefined;
  const begin = () => {
    controller?.cancel();
    controller = target.value
      ? track(
          target.value,
          (p) => {
            value.value = p;
          },
          {
            ...(options.range ? { range: options.range } : {}),
            ...(options.axis ? { axis: options.axis } : {}),
          },
        )
      : undefined;
  };
  onMounted(begin);
  watch(target, begin);
  onBeforeUnmount(() => controller?.cancel());
  return value;
}

/**
 * The active step (0-based) of a scroll story: a tall section whose content
 * stays pinned with `position: sticky`.
 */
export function useStory(
  target: Target,
  options: { steps: number; range?: string; axis?: "block" | "inline" },
): { step: Ref<number> } {
  const step = ref(0);
  let controller: Controller | undefined;
  const begin = () => {
    controller?.cancel();
    controller = target.value
      ? story(target.value, {
          steps: options.steps,
          onStep: (s) => {
            step.value = s;
          },
          ...(options.range ? { range: options.range } : {}),
          ...(options.axis ? { axis: options.axis } : {}),
        })
      : undefined;
  };
  onMounted(begin);
  watch(target, begin);
  onBeforeUnmount(() => controller?.cancel());
  return { step };
}

/** `true` when the user prefers reduced motion. Updates when the setting changes. */
export function useReducedMotion(): Ref<boolean> {
  const reduced = ref(false);
  let query: MediaQueryList | undefined;
  const update = () => {
    reduced.value = !!query?.matches;
  };
  onMounted(() => {
    query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    reduced.value = prefersReducedMotion();
    query?.addEventListener?.("change", update);
  });
  onBeforeUnmount(() => query?.removeEventListener?.("change", update));
  return reduced;
}

type RevealValue =
  | RevealOptions["keyframes"]
  | (RevealOptions & { preset?: RevealOptions["keyframes"] });

function revealOptions(value: RevealValue): RevealOptions {
  if (!value || typeof value === "string" || Array.isArray(value)) {
    return { keyframes: value as RevealOptions["keyframes"] };
  }
  const { preset, ...rest } = value as RevealOptions & { preset?: RevealOptions["keyframes"] };
  return { ...rest, keyframes: rest.keyframes ?? preset };
}

const controllers = new WeakMap<Element, { key: string; controller: Controller }>();

function directive<V>(start: (el: Element, value: V) => Controller): Directive<Element, V> {
  const apply = (el: Element, value: V) => {
    const key = keyOf(value);
    if (controllers.get(el)?.key === key) return;
    controllers.get(el)?.controller.cancel();
    controllers.set(el, { key, controller: start(el, value) });
  };
  return {
    mounted: (el, { value }) => apply(el, value),
    updated: (el, { value }) => apply(el, value),
    unmounted(el) {
      controllers.get(el)?.controller.cancel();
      controllers.delete(el);
    },
  };
}

/**
 * Reveals the element as it scrolls into view.
 *
 * @example <h2 v-reveal="'fade-up'">…</h2>
 * @example <li v-reveal="{ preset: 'scale-in', shift: i * 8 }">…</li>
 */
export const vReveal: Directive<Element, RevealValue> = directive((el, value) =>
  reveal(el, revealOptions(value)),
);

/** Moves the element slower than the page. `v-parallax="40"` sets the distance in pixels. */
export const vParallax: Directive<Element, number | ParallaxOptions | undefined> = directive(
  (el, value) => parallax(el, typeof value === "number" ? { distance: value } : (value ?? {})),
);

/** Registers `v-reveal` and `v-parallax` for the whole app. */
export const SigmoidPlugin = {
  install(app: App) {
    app.directive("reveal", vReveal);
    app.directive("parallax", vParallax);
  },
};
