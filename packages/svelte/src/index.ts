import {
  type Controller,
  parallax as coreParallax,
  reveal as coreReveal,
  story as coreStory,
  track as coreTrack,
  type ParallaxOptions,
  type RevealOptions,
  type TrackOptions,
} from "@sweberdev/sigmoid";

/** A Svelte action: `use:name={params}`. Written without importing Svelte, so it works with Svelte 4 and 5. */
export type SigmoidAction<P> = (
  node: Element,
  params?: P,
) => { update(params?: P): void; destroy(): void };

type RevealParams =
  | RevealOptions["keyframes"]
  | (RevealOptions & { preset?: RevealOptions["keyframes"] });

const keyOf = (o: unknown) =>
  JSON.stringify(o, (_k, v) => (typeof v === "function" ? (v as { css: string }).css : v));

/** Starts a Sigmoid animation on the node and restarts it when the parameters change by value. */
function action<P>(start: (node: Element, params: P | undefined) => Controller): SigmoidAction<P> {
  return (node, params) => {
    let key = keyOf(params);
    let controller = start(node, params);
    return {
      update(next) {
        const nextKey = keyOf(next);
        if (nextKey === key) return;
        key = nextKey;
        controller.cancel();
        controller = start(node, next);
      },
      destroy() {
        controller.cancel();
      },
    };
  };
}

function revealOptions(value: RevealParams | undefined): RevealOptions {
  if (!value || typeof value === "string" || Array.isArray(value)) {
    return { keyframes: value as RevealOptions["keyframes"] };
  }
  const { preset, ...rest } = value as RevealOptions & { preset?: RevealOptions["keyframes"] };
  return { ...rest, keyframes: rest.keyframes ?? preset };
}

/**
 * Reveals the node as it scrolls into view.
 *
 * @example <h2 use:reveal={"fade-up"}>…</h2>
 * @example <li use:reveal={{ preset: "scale-in", shift: i * 8 }}>…</li>
 */
export const reveal: SigmoidAction<RevealParams> = action((node, params) =>
  coreReveal(node, revealOptions(params)),
);

/** Moves the node slower than the page. `use:parallax={40}` sets the distance in pixels. */
export const parallax: SigmoidAction<number | ParallaxOptions> = action((node, params) =>
  coreParallax(node, typeof params === "number" ? { distance: params } : (params ?? {})),
);

/**
 * Reports the view progress (0 to 1) of the node.
 *
 * @example <p use:track={{ onProgress: (p) => (value = p) }}>…</p>
 */
export const track: SigmoidAction<TrackOptions & { onProgress: (progress: number) => void }> =
  action((node, params) =>
    coreTrack(node, (p) => params?.onProgress?.(p), {
      ...(params?.range ? { range: params.range } : {}),
      ...(params?.axis ? { axis: params.axis } : {}),
    }),
  );

/**
 * Reports the active step of a scroll story on the node.
 *
 * @example <section use:story={{ steps: 3, onStep: (i) => (step = i) }}>…</section>
 */
export const story: SigmoidAction<{
  steps: number;
  onStep?: (step: number) => void;
  range?: string;
  axis?: "block" | "inline";
}> = action((node, params) =>
  coreStory(node, {
    steps: params?.steps ?? 1,
    onStep: params?.onStep ?? (() => {}),
    ...(params?.range ? { range: params.range } : {}),
    ...(params?.axis ? { axis: params.axis } : {}),
  }),
);
