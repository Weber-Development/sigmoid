// Size and scroll cost of the same effect, "fade-up cards while scrolling in", with
// Sigmoid, GSAP ScrollTrigger, Motion and AOS. Run: `pnpm bench` (needs Chromium).
// Results go to results.json and results.md. Numbers depend on the machine: compare
// the libraries with each other, not with other machines.
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";
import { chromium } from "playwright";

const COUNTS = [30, 300];
const STEPS = 150;
const RUNS = 5;

const snippets = {
  "No library": `void 0;`,
  "Sigmoid (CSS only)": `void 0;`,
  "Sigmoid (native)": `import { reveal } from "@sweberdev/sigmoid";
    reveal(".card", { keyframes: "fade-up" });`,
  "Sigmoid (fallback)": `import { reveal } from "@sweberdev/sigmoid";
    reveal(".card", { keyframes: "fade-up", fallback: true });`,
  "GSAP ScrollTrigger": `import gsap from "gsap";
    import { ScrollTrigger } from "gsap/ScrollTrigger";
    gsap.registerPlugin(ScrollTrigger);
    for (const el of gsap.utils.toArray(".card")) {
      gsap.from(el, { opacity: 0, y: 24, scrollTrigger: { trigger: el, start: "top bottom", end: "top 60%", scrub: true } });
    }`,
  Motion: `import { animate, scroll } from "motion";
    for (const el of document.querySelectorAll(".card")) {
      scroll(animate(el, { opacity: [0, 1], y: [24, 0] }), { target: el, offset: ["start end", "start 60%"] });
    }`,
  "AOS (fires once)": `import AOS from "aos";
    AOS.init();`,
};

const root = new URL("..", import.meta.url).pathname;
const dir = mkdtempSync(join(tmpdir(), "sigmoid-bench-"));
const sizes = {};
const bundles = {};
for (const [name, code] of Object.entries(snippets)) {
  const out = await build({
    stdin: { contents: code, resolveDir: join(root, "bench"), loader: "js" },
    bundle: true,
    minify: true,
    format: "iife",
    write: false,
    logLevel: "error",
  });
  const bytes = out.outputFiles[0].contents;
  sizes[name] = gzipSync(bytes, { level: 9 }).length;
  bundles[name] = bytes;
}

const css = readFileSync(join(root, "packages/core/dist/sigmoid.css"), "utf8");
const cardsFor = (n) =>
  Array.from(
    { length: n },
    (_, i) =>
      `<div class="card" data-sigmoid="fade-up" data-aos="fade-up" style="height:160px;margin:40px 0;background:#ddd">${i}</div>`,
  ).join("");
const page = (script, withCss, cards) =>
  `<!doctype html>${withCss ? `<style>${css}</style>` : ""}<body style="margin:0;padding:0 24px">${cards}<script>${script}</script>`;

const browser = await chromium
  .launch()
  .catch(() =>
    chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" }),
  );

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const runtime = {};
for (const count of COUNTS) {
  const cards = cardsFor(count);
  runtime[count] = {};
  for (const name of Object.keys(snippets)) {
    const runs = [];
    for (let r = 0; r < RUNS; r++) {
      const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
      const p = await context.newPage();
      const cdp = await context.newCDPSession(p);
      await cdp.send("Performance.enable");
      const file = join(dir, `${count}-${name.replace(/\W+/g, "-")}.html`);
      writeFileSync(
        file,
        page(Buffer.from(bundles[name]).toString("utf8"), name === "Sigmoid (CSS only)", cards),
      );
      await p.goto(`file://${file}`);
      await p.waitForTimeout(300);
      const metrics = async () =>
        Object.fromEntries(
          (await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]),
        );
      const before = await metrics();
      await p.evaluate(async (steps) => {
        const max = document.documentElement.scrollHeight - innerHeight;
        for (let i = 1; i <= steps; i++) {
          scrollTo(0, (max * i) / steps);
          await new Promise((res) => requestAnimationFrame(res));
        }
      }, STEPS);
      const after = await metrics();
      const ms = (k) => (after[k] - before[k]) * 1000;
      runs.push({
        script: ms("ScriptDuration"),
        task: ms("TaskDuration"),
        style: ms("RecalcStyleDuration"),
      });
      await context.close();
    }
    runtime[count][name] = Object.fromEntries(
      ["script", "task", "style"].map((k) => [k, +median(runs.map((x) => x[k])).toFixed(1)]),
    );
  }
}
await browser.close();

const results = { counts: COUNTS, steps: STEPS, runs: RUNS, sizes, runtime };
writeFileSync(new URL("results.json", import.meta.url), `${JSON.stringify(results, null, 2)}\n`);
const table = (count) => {
  const rows = Object.keys(snippets).map(
    (n) =>
      `| ${n} | ${(sizes[n] / 1000).toFixed(1)} kB | ${runtime[count][n].script} ms | ${runtime[count][n].task} ms | ${runtime[count][n].style} ms |`,
  );
  return `${count} elements, ${STEPS} scroll steps, median of ${RUNS} runs:\n\n| Library | Size (min+gzip) | JavaScript | Main-thread tasks | Style recalc |\n|---|---|---|---|---|\n${rows.join("\n")}\n`;
};
const md = COUNTS.map(table).join("\n");
writeFileSync(new URL("results.md", import.meta.url), md);
console.log(md);

// Keep the docs page in step with the results.
const docPath = new URL("../docs/reference/benchmark.md", import.meta.url);
const doc = readFileSync(docPath, "utf8");
writeFileSync(
  docPath,
  doc.replace(
    /<!-- bench:start -->[\s\S]*<!-- bench:end -->/,
    `<!-- bench:start -->\n${md}<!-- bench:end -->`,
  ),
);
