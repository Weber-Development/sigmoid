// Real-browser check: the native CSS view timeline and the JavaScript fallback
// must give the same opacity at every scroll position, on the page and inside
// a scroll container. Run with `pnpm e2e` (needs Chromium: `npx playwright install chromium`).
import { mkdtempSync, writeFileSync } from "node:fs";
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
writeFileSync(
  join(dir, "t.html"),
  `<!doctype html><body style="margin:0">
<div style="height:1500px"></div><div id="p" style="height:200px">page</div><div style="height:1500px"></div>
<div id="box" style="height:400px;overflow-y:auto"><div style="height:1000px"></div>
<div id="c" style="height:100px">container</div><div style="height:1000px"></div></div>
<div style="height:1000px"></div><script src="s.js"></script>`,
);

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(`file://${join(dir, "t.html")}`);

const result = await page.evaluate(async () => {
  const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const kf = [{ opacity: 0 }, { opacity: 1 }];
  const out = [];
  for (const [id, scroll] of [
    ["p", (v) => scrollTo(0, v)],
    [
      "c",
      (v) => {
        document.getElementById("box").scrollTop = v;
      },
    ],
  ]) {
    const el = document.getElementById(id);
    const values = id === "p" ? [1000, 1300, 1500, 1700, 1900] : [700, 800, 900, 1000];
    const read = {};
    for (const fallback of [false, true]) {
      const c = S.reveal(el, { keyframes: kf, range: "cover", easing: "linear", fallback });
      read[fallback] = [];
      for (const v of values) {
        scroll(v);
        await frames();
        read[fallback].push(+Number.parseFloat(getComputedStyle(el).opacity).toFixed(2));
      }
      c.cancel();
      scroll(0);
      await frames();
    }
    out.push({
      id,
      native: read.false,
      fallback: read.true,
      supported: S.supportsScrollTimeline(),
    });
  }
  return out;
});
await browser.close();

let failed = errors.length > 0;
for (const r of result) {
  const same = r.native.every((v, i) => Math.abs(v - r.fallback[i]) <= 0.02);
  console.log(`${same ? "ok  " : "FAIL"} ${r.id}: native ${r.native} | fallback ${r.fallback}`);
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
