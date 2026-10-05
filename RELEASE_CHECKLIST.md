# Release checklist (package-launch)

| Item | Status |
|---|---|
| Repo `Weber-Development/sigmoid` | created by the werkbank, private, `NPM_TOKEN` set |
| npm `@sweberdev/sigmoid`, `@sweberdev/sigmoid-react` | changeset for 0.1.0 on `main`; merging the version PR publishes |
| packages.sweber.dev | entry, docs config and live demo in `sxwxbxr/portfoliov3` (branch `packages/sigmoid`) |
| Docs | Markdown in `docs/` with `nav.json`, rendered at packages.sweber.dev/sigmoid/docs once the repo is public |
| Pro | none for now (decision 2026-10-05); idea: scroll-story sections, preset pack, curve editor |
| Polar | not needed |
| Trademark check "Sigmoid" | open (Seya) |

## Open (Seya)

- [ ] Merge the version PR so 0.1.0 goes to npm.
- [ ] Say "öffentlich machen" so the werkbank makes the repo public (needed for the docs).
- [ ] Trademark check.

## Later

- End-to-end test in a real browser in CI (native and fallback were compared by hand in Chromium on 2026-10-05: same progress at the same scroll position).
- Fallback for view timelines inside scroll containers other than the page.
