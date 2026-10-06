---
title: Stability
description: What stays the same in 1.x, how versions are numbered and how things are deprecated.
---

Sigmoid follows [semantic versioning](https://semver.org). The API listed in this documentation is frozen as of 0.9.0, the release candidate: 1.0.0 will contain no API changes, only fixes found during the candidate phase. From 1.0.0 on:

- **Patch** (1.0.x): bug fixes only.
- **Minor** (1.x.0): new features, new options with defaults that keep the old behaviour, new exports. Nothing breaks.
- **Major** (2.0.0): anything that can break existing code.

## What counts as the public API

- Everything listed in the [API reference](api.md): the exports of `@sweberdev/sigmoid`, `@sweberdev/sigmoid/easing`, `@sweberdev/sigmoid-react`, `@sweberdev/sigmoid-vue` and `@sweberdev/sigmoid-svelte`, with their options and return values.
- The `data-sigmoid*` attributes, the `--sigmoid-*` custom properties, the preset names and the `--sigmoid-ease-*` variables in `sigmoid.css` and `tailwind.css`.
- The file names in `exports` of each package.

Tests check the export lists of every package: removing or renaming an export fails CI.

## What does not

- The exact CSS of `sigmoid.css`, such as selectors beyond the attributes above, and the `linear()` stops of an easing. Curves keep their shape, but a minor version may sample them differently.
- Internal measuring details, such as when the fallback measures again. `refresh()` stays.
- The `src` folder in the package. Use the documented entry points.
- Console output.

## Versions move together

`@sweberdev/sigmoid`, `-react`, `-vue` and `-svelte` share one version number. Install matching versions.

## Deprecations

A feature is first marked `@deprecated` in the types and the docs, with the replacement, and keeps working for at least one minor version and six months before a major release removes it. The changelog of each release lists what was deprecated.

## Browsers

Sigmoid supports the current and previous major versions of Chrome, Edge, Safari and Firefox. Dropping a browser is a minor change when it needs no code change from you, and is announced in the changelog. The [browser support](browser-support.md) page shows what CI covers.
