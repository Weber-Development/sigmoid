// Real-browser check: the native CSS view timeline and the JavaScript fallback
// must give the expected opacity at every scroll position, on the page, inside a
// scroll container and on the inline axis. Browsers without scroll timelines
// (Firefox) run the fallback only. Run with `pnpm e2e` (BROWSER=chromium|firefox|webkit,
// needs the browser: `npx playwright install chromium`).
import { copyFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "esbuild";
import { chromium, firefox, webkit } from "playwright";

const name = process.env.BROWSER ?? "chromium";
const engine = { chromium, firefox, webkit }[name];
const dir = mkdtempSync(join(tmpdir(), "sigmoid-e2e-"));
const bundle = await build({
  entryPoints: [new URL("../packages/core/dist/index.js", import.meta.url).pathname],
  bundle: true,
  format: "iife",
  globalName: "S",
  write: false,
});
writeFileSync(join(dir, "s.js"), bundle.outputFiles[0].contents);
copyFileSync(
  new URL("../packages/core/dist/sigmoid.css", import.meta.url).pathname,
  join(dir, "sigmoid.css"),
);
writeFileSync(
  join(dir, "t.html"),
  `<!doctype html><link rel="stylesheet" href="sigmoid.css"><body style="margin:0">
<div style="height:1500px"></div><div id="p" style="height:200px">page</div><div style="height:1500px"></div>
<div id="box" style="height:400px;overflow-y:auto"><div style="height:1000px"></div>
<div id="c" style="height:100px">container</div><div style="height:1000px"></div></div>
<div id="hbox" style="width:400px;overflow-x:auto;white-space:nowrap"><div style="display:inline-block;width:1000px;height:20px"></div><div id="h" style="display:inline-block;width:100px;height:50px">h</div><div style="display:inline-block;width:1000px;height:20px"></div></div>
<div style="height:2000px"></div>
<div id="n" data-sigmoid="count" style="--sigmoid-count:1000;height:60px"></div>
<div id="stage" data-sigmoid-timeline="stage" style="height:1000px"></div>
<div id="f" data-sigmoid-follow="stage" data-sigmoid-preset="fade-in" style="height:20px;--sigmoid-easing:linear">follow</div>
<div style="height:3000px"></div><script src="s.js"></script>`,
);

const browser = await engine
  .launch()
  .catch(() =>
    engine.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" }),
  );
const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(`file://${join(dir, "t.html")}`);

const result = await page.evaluate(async () => {
  const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const kf = [{ opacity: 0 }, { opacity: 1 }];
  const box = document.getElementById("box");
  const hbox = document.getElementById("hbox");
  const supported = S.supportsScrollTimeline();
  const cases = [
    {
      name: "page",
      id: "p",
      options: { range: "cover" },
      values: [1000, 1300, 1500, 1700, 1900],
      expected: [0.3, 0.6, 0.8, 1, 1],
      scroll: (v) => scrollTo(0, v),
      reset: () => scrollTo(0, 0),
    },
    {
      name: "container",
      id: "c",
      options: { range: "cover" },
      values: [700, 800, 900, 1000],
      expected: [0.2, 0.4, 0.6, 0.8],
      scroll: (v) => {
        box.scrollTop = v;
      },
      reset: () => {
        box.scrollTop = 0;
      },
    },
    {
      name: "inline axis",
      id: "h",
      options: { range: "cover", axis: "inline" },
      values: [700, 800, 900, 1000],
      expected: [0.2, 0.4, 0.6, 0.8],
      scroll: (v) => {
        hbox.scrollLeft = v;
      },
      reset: () => {
        hbox.scrollLeft = 0;
      },
    },
  ];
  const out = [];
  const opacity = (el) => +Number.parseFloat(getComputedStyle(el).opacity).toFixed(2);

  for (const { name, id, options, values, expected, scroll, reset } of cases) {
    const el = document.getElementById(id);
    for (const fallback of supported ? [false, true] : [true]) {
      const c = S.reveal(el, { keyframes: kf, easing: "linear", fallback, ...options });
      const got = [];
      for (const v of values) {
        scroll(v);
        await frames();
        got.push(opacity(el));
      }
      c.cancel();
      reset();
      await frames();
      out.push({ name: `${name} (${fallback ? "fallback" : "native"})`, got, expected });
    }
  }

  // scrub with a range: 25% to 75% of the page scroll.
  {
    const el = document.getElementById("p");
    const max = document.documentElement.scrollHeight - innerHeight;
    const values = [0.1, 0.25, 0.5, 0.75, 0.9].map((f) => Math.round(f * max));
    for (const fallback of supported ? [false, true] : [true]) {
      const c = S.scrub(el, kf, { range: [25, 75], easing: "linear", fallback });
      const got = [];
      for (const v of values) {
        scrollTo(0, v);
        await frames();
        got.push(opacity(el));
      }
      c.cancel();
      scrollTo(0, 0);
      await frames();
      out.push({
        name: `scrub range (${fallback ? "fallback" : "native"})`,
        got,
        expected: [0, 0, 0.5, 1, 1],
      });
    }
  }

  // Linked animation: the follower is driven by the stage element. 1000 px stage:
  // "cover 0% cover 40%" of 1000 + 800 px is 720 px of scroll.
  {
    const stop = S.init(document);
    const stage = document.getElementById("stage");
    const top = stage.getBoundingClientRect().top + scrollY;
    const got = [];
    for (const v of [top - 800, top - 440, top - 80, top + 300]) {
      scrollTo(0, v);
      await frames();
      got.push(opacity(document.getElementById("f")));
    }
    stop();
    scrollTo(0, 0);
    await frames();
    out.push({ name: "linked animation", got, expected: [0, 0.5, 1, 1] });
  }

  // data-sigmoid="count": CSS only where scroll timelines exist, init() elsewhere.
  {
    const stop = supported ? () => {} : S.init(document);
    const el = document.getElementById("n");
    const top = el.getBoundingClientRect().top + scrollY;
    const shown = [];
    for (const v of [top - 900, top - 600, top + 100]) {
      scrollTo(0, v);
      await frames();
      const cs = getComputedStyle(el);
      const n = supported
        ? Number.parseFloat(cs.getPropertyValue("--sigmoid-n"))
        : Number.parseInt(cs.counterReset.split(" ")[1], 10);
      shown.push(
        Number.isNaN(n)
          ? `NaN(${cs.getPropertyValue("--sigmoid-n")}|${cs.counterReset})`
          : Math.round(n),
      );
    }
    stop();
    out.push({
      name: `count (${supported ? "css" : "init"})`,
      got: shown,
      expected: [0, "500-1000", 1000],
      range: true,
    });
  }
  // The layout changes after the animation started: 300 px are added above the element.
  {
    const el = document.getElementById("p");
    const c = S.reveal(el, { keyframes: kf, easing: "linear", range: "cover", fallback: true });
    const spacer = document.createElement("div");
    spacer.style.height = "300px";
    document.body.prepend(spacer);
    const got = [];
    for (const v of [1300, 1600, 1800]) {
      scrollTo(0, v);
      await frames();
      await frames();
      got.push(opacity(el));
    }
    c.cancel();
    spacer.remove();
    scrollTo(0, 0);
    out.push({ name: "layout change", got, expected: [0.3, 0.6, 0.8] });
  }
  return { out, supported };
});
await browser.close();

let failed = errors.length > 0;
console.log(`${name}: scroll timelines ${result.supported ? "native" : "fallback only"}`);
for (const r of result.out) {
  const same = r.range
    ? r.got[0] === 0 && r.got[1] >= 500 && r.got[1] <= 1000 && r.got[2] === 1000
    : r.got.every((v, i) => Math.abs(v - r.expected[i]) <= 0.03);
  const line = `${same ? "ok  " : "FAIL"} ${r.name}: got ${r.got} expected ${r.expected}`;
  console.log(line);
  if (!same) {
    failed = true;
    if (process.env.GITHUB_ACTIONS) console.log(`::error title=${name}::${line}`);
  }
}
if (errors.length) {
  console.log("page errors:", errors);
  if (process.env.GITHUB_ACTIONS)
    console.log(`::error title=${name} page errors::${errors.join(" | ")}`);
}
process.exit(failed ? 1 : 0);
