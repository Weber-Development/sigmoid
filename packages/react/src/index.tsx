import {
  type Controller,
  type Easing,
  type ParallaxOptions,
  type PresetName,
  parallax,
  prefersReducedMotion,
  progress,
  type RevealOptions,
  reveal,
  type ScrubOptions,
  scrub,
  story,
  type TrackOptions,
  track,
} from "@sweberdev/sigmoid";
import {
  type ComponentPropsWithoutRef,
  createElement,
  type ElementType,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

type Start = (el: Element) => Controller;

/** Runs a Sigmoid animation on a ref and cancels it on unmount or change. */
function useMotion(ref: RefObject<Element | null>, start: Start, key: string) {
  const startRef = useRef(start);
  startRef.current = start;
  // biome-ignore lint/correctness/useExhaustiveDependencies: key captures the options
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const c = startRef.current(el);
    return () => c.cancel();
  }, [ref, key]);
}

const keyOf = (o: object) =>
  JSON.stringify(o, (_k, v) => (typeof v === "function" ? (v as Easing).css : v));

/** Reveals the referenced element as it scrolls into view. */
export function useReveal(ref: RefObject<Element | null>, options: RevealOptions = {}) {
  useMotion(ref, (el) => reveal(el, options), keyOf(options));
}

/** Moves the referenced element against the scroll direction. */
export function useParallax(ref: RefObject<Element | null>, options: ParallaxOptions = {}) {
  useMotion(ref, (el) => parallax(el, options), keyOf(options));
}

/** Links keyframes to the scroll position of the page or a container. */
export function useScrub(
  ref: RefObject<Element | null>,
  keyframes: Keyframe[],
  options: ScrubOptions = {},
) {
  useMotion(ref, (el) => scrub(el, keyframes, options), keyOf([keyframes, options]));
}

/**
 * The view progress (0 to 1) of the referenced element, for counters and
 * other values CSS cannot animate. Re-renders on every change, so keep the
 * component small.
 */
export function useScrollProgress(
  ref: RefObject<Element | null>,
  options: TrackOptions = {},
): number {
  const [value, setValue] = useState(0);
  const { range, axis } = options;
  useEffect(() => {
    const c = track(ref.current, setValue, {
      ...(range ? { range } : {}),
      ...(axis ? { axis } : {}),
    });
    return () => c.cancel();
  }, [ref, range, axis]);
  return value;
}

/**
 * The active step (0-based) and progress of a scroll story: a tall section
 * whose content stays pinned with `position: sticky`. Re-renders only when
 * the step changes.
 *
 * @example const { step } = useStory(ref, { steps: 3 })
 */
export function useStory(
  ref: RefObject<Element | null>,
  options: { steps: number; range?: string; axis?: "block" | "inline" },
): { step: number } {
  const [step, setStep] = useState(0);
  const { steps, range, axis } = options;
  useEffect(() => {
    const c = story(ref.current, {
      steps,
      onStep: setStep,
      ...(range ? { range } : {}),
      ...(axis ? { axis } : {}),
    });
    return () => c.cancel();
  }, [ref, steps, range, axis]);
  return { step };
}

/** `true` when the user prefers reduced motion. Updates when the setting changes. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduced(prefersReducedMotion());
    const update = () => setReduced(!!query?.matches);
    query?.addEventListener?.("change", update);
    return () => query?.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

type Polymorphic<T extends ElementType, P> = P & { as?: T } & Omit<
    ComponentPropsWithoutRef<T>,
    keyof P | "as"
  >;

export type RevealProps<T extends ElementType = "div"> = Polymorphic<
  T,
  {
    /** Preset name or own keyframes. Default `"fade-up"`. */
    preset?: PresetName | Keyframe[];
    /** CSS `animation-range`. Default `"entry 0% cover 40%"`. */
    range?: string;
    easing?: Easing | string;
    reducedMotion?: "skip" | "allow";
    /** Percent the range starts later. In a list, `index * 8` staggers the items. */
    shift?: number;
    /** `"inline"` for horizontal scrolling. Default `"block"`. */
    axis?: "block" | "inline";
  }
>;

/**
 * Reveals its content as it scrolls into view.
 *
 * @example <Reveal preset="fade-up" easing={ease.bouncy}>…</Reveal>
 */
export function Reveal<T extends ElementType = "div">({
  as,
  preset,
  range,
  easing,
  reducedMotion,
  shift,
  axis,
  ...rest
}: RevealProps<T>) {
  const ref = useRef<Element>(null);
  useReveal(ref, { keyframes: preset, range, easing, reducedMotion, shift, axis });
  return createElement(as ?? "div", { ...rest, ref });
}

export type ParallaxProps<T extends ElementType = "div"> = Polymorphic<
  T,
  {
    /** Pixels moved in each direction. Default 60. */
    distance?: number;
    reducedMotion?: "skip" | "allow";
  }
>;

/** Moves its content slower than the page while it crosses the viewport. */
export function Parallax<T extends ElementType = "div">({
  as,
  distance,
  reducedMotion,
  ...rest
}: ParallaxProps<T>) {
  const ref = useRef<Element>(null);
  useParallax(ref, { distance, reducedMotion });
  return createElement(as ?? "div", { ...rest, ref });
}

export type ScrollProgressProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  /** Scroll container. Default: the page. */
  source?: RefObject<Element | null>;
};

/**
 * A reading progress bar. Unstyled apart from its scale: give it a height and
 * a background, e.g. `className="fixed inset-x-0 top-0 h-1 bg-black"`.
 */
export function ScrollProgress({ source, ...rest }: ScrollProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(
    ref,
    (el) => progress(el, source?.current ? { source: source.current } : {}),
    String(!!source),
  );
  return <div aria-hidden="true" {...rest} ref={ref} />;
}
