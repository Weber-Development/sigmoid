# Release checklist

| Item | Status |
|---|---|
| Repo `Weber-Development/sigmoid` | public, MIT |
| npm `@sweberdev/sigmoid`, `-react`, `-vue`, `-svelte` | published with provenance by the release workflow, one fixed version |
| packages.sweber.dev | package page, docs, live demo, curve editor and release posts in `sxwxbxr/portfoliov3` |
| Pro | none (decision 2026-10-05) |
| Polar | not needed |
| Trademark check "Sigmoid" | open (Seya) |

## Per release

1. Feature PR with a changeset; CI runs unit tests, size budgets and the browser tests (Chromium, Firefox, WebKit).
2. Merge the version PR the changesets bot opens; the release workflow publishes.
3. portfoliov3: release post `content/blog/sigmoid-<version>-released.md`, release entry in `content/packages/sigmoid.json`, vendored copy of the core source for the demo.
