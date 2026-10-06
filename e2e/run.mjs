// Real-browser check: the native CSS view timeline and the JavaScript fallback
// must give the same opacity at every scroll position, on the page and inside
// a scroll container. Run with `pnpm e2e` (needs Chromium: `npx playwright install chromium`).
import { copyFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "esbuild";
import { chromium } from "playwright";

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
<div style="height:3000px"></div><script src="s.js"></script>`,
);

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(`file://${join(dir, "t.html")}`);

const result = await page.evaluate(async () => {
  const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const kf = [{ opacity: 0 }, { opacity: 1 }];
  const box = document.getElementById("box");
  const hbox = document.getElementById("hbox");
  const cases = [
    {
      id: "p",
      options: { range: "cover" },
      values: [1000, 1300, 1500, 1700, 1900],
      scroll: (v) => scrollTo(0, v),
      reset: () => scrollTo(0, 0),
    },
    {
      id: "c",
      options: { range: "cover" },
      values: [700, 800, 900, 1000],
      scroll: (v) => {
        box.scrollTop = v;
      },
      reset: () => {
        box.scrollTop = 0;
      },
    },
    {
      id: "h",
      options: { range: "cover", axis: "inline" },
      values: [700, 800, 900, 1000],
      scroll: (v) => {
        hbox.scrollLeft = v;
      },
      reset: () => {
        hbox.scrollLeft = 0;
      },
    },
  ];
  const out = [];
  for (const { id, options, values, scroll, reset } of cases) {
    const el = document.getElementById(id);
    const read = {};
    for (const fallback of [false, true]) {
      const c = S.reveal(el, { keyframes: kf, easing: "linear", fallback, ...options });
      read[fallback] = [];
      for (const v of values) {
        scroll(v);
        await frames();
        read[fallback].push(+Number.parseFloat(getComputedStyle(el).opacity).toFixed(2));
      }
      c.cancel();
      reset();
      await frames();
    }
    out.push({
      name: id === "h" ? "h (inline axis)" : id,
      native: read.false,
      fallback: read.true,
      supported: S.supportsScrollTimeline(),
    });
  }

  // scrub with a range: 25% to 75% of the page scroll.
  {
    const el = document.getElementById("p");
    const max = document.documentElement.scrollHeight - innerHeight;
    const values = [0.1, 0.25, 0.5, 0.75, 0.9].map((f) => Math.round(f * max));
    const read = {};
    for (const fallback of [false, true]) {
      const c = S.scrub(el, kf, { range: [25, 75], easing: "linear", fallback });
      read[fallback] = [];
      for (const v of values) {
        scrollTo(0, v);
        await frames();
        read[fallback].push(+Number.parseFloat(getComputedStyle(el).opacity).toFixed(2));
      }
      c.cancel();
      scrollTo(0, 0);
      await frames();
    }
    out.push({ name: "scrub range", native: read.false, fallback: read.true, supported: true });
  }

  // data-sigmoid="count": zero JavaScript, native only. Starts at 0, ends at the target.
  {
    const el = document.getElementById("n");
    const top = el.getBoundingClientRect().top + scrollY;
    const shown = [];
    for (const v of [top - 900, top - 600, top + 100]) {
      scrollTo(0, v);
      await frames();
      shown.push(Number.parseInt(getComputedStyle(el).counterReset.split(" ")[1], 10));
    }
    out.push({ name: "count", native: shown, fallback: [0, shown[1], 1000], supported: true });
  }
  return out;
});
await browser.close();

let failed = errors.length > 0;
for (const r of result) {
  const tol = r.name === "count" ? 600 : 0.02;
  const same = r.native.every((v, i) => Math.abs(v - r.fallback[i]) <= tol);
  console.log(`${same ? "ok  " : "FAIL"} ${r.name}: native ${r.native} | fallback ${r.fallback}`);
  failed ||= !same || !r.supported;
}
if (errors.length) console.log("page errors:", errors);
process.exit(failed ? 1 : 0);

async function launch() {
  try {
    return await chromium.launch();
  } catch {
    return chromium.launch({
      executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
    });
  }
}
