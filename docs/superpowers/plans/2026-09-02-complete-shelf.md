# Complete Shelf Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone React/Vite project that renders the exact-source `CompleteShelfLandingPage` configuration.

**Architecture:** Vite serves the byte-exact canonical HTML from `public/`; a typed local adapter preserves the requested package import and delegates to the registered iframe frame behavior. Vitest validates the public API and source hashes, while browser QA validates the authored Three.js runtime.

**Tech Stack:** React 19, TypeScript, Vite 8, Vitest, Testing Library, authored Three.js r165 CDN import map.

**Spec:** `docs/superpowers/specs/2026-09-02-complete-shelf-design.md`

## Global Constraints

- Preserve canonical HTML and registered CSS bytes and hashes.
- Preserve the exact configured `CompleteShelfLandingPage` props.
- Keep Three.js at r165 as authored.
- Stop rather than approximate if any required source cannot be retrieved or verified.

---

### Task 1: React/Vite application shell

**Files:** Create `package.json`, Vite/TypeScript configs, `index.html`, and `src/main.tsx`.

**Interfaces:** Produces the `@designcodeio/threeui` and `@designcodeio/threeui/style.css` aliases consumed by `src/Scene.tsx`.

- [ ] Add a failing smoke test for the configured scene.
- [ ] Add the minimal React/Vite scaffold and exact `Scene` usage.
- [ ] Install dependencies and confirm the smoke test reaches the missing adapter.

### Task 2: Exact ThreeUI source and adapter

**Files:** Create the registered files under `src/shaders/` and `public/landing-pages/`, plus focused adapter files under `src/threeui/`.

**Interfaces:** Produce `CompleteShelfLandingPage(props: LandingPageProps & PageTypographyProps)` and `style.css` compatibility through Vite aliases.

- [ ] Fetch the registered bundle and canonical HTML.
- [ ] Verify all four required SHA-256 values before integration.
- [ ] Implement the adapter from the registered component/frame source without altering authored HTML behavior.
- [ ] Make the smoke test pass.

### Task 3: Verification and browser QA

**Files:** Add source-integrity and component behavior tests; update only focused runtime styles if QA exposes a wrapper issue.

**Interfaces:** `npm test` validates source/API behavior; `npm run build` produces a deployable `dist/`.

- [ ] Add deterministic hash tests for registered files.
- [ ] Run tests, TypeScript, and production build.
- [ ] Serve the built app and inspect desktop/mobile rendering, WebGL initialization, console errors, and authored interactions.
- [ ] Record any unavoidable external-network requirement in the README.
