# Complete Shelf Exact-Source Design

## Goal

Create a standalone React/Vite application that renders the configured `CompleteShelfLandingPage` usage while preserving ThreeUI's canonical HTML, CSS, Three.js r165 presentation, interactions, and responsive behavior.

## Architecture

- The Vite app mounts a single `Scene` component and imports `CompleteShelfLandingPage` through the requested `@designcodeio/threeui` module specifier.
- A local ThreeUI adapter exposes the requested component API and delegates rendering to the registered `LandingPageFrame` behavior. The frame loads `/landing-pages/complete-shelf-v2.html` from Vite's public directory, keeping the authored page isolated and executable as a complete DOM/CSS/Three.js document.
- The canonical HTML and registered shared CSS are copied byte-for-byte from ThreeUI and validated against the prompt's SHA-256 values. The registered source files are retained under their required paths for provenance.

## Constraints

- Canonical HTML SHA-256: `606f200fed8602c243f40a11c8c364f0e625c57f80e7c97dc76419da207f198e`.
- Three.js remains pinned to `0.165.0` by the canonical HTML import map.
- The configured typography/color/size props are passed exactly as supplied.
- No screenshot-based recreation, documentation embedding, or authored-scene substitutions.
- The page requires network access at runtime for the pinned jsDelivr Three.js modules and Google Fonts referenced by the canonical source.

## Acceptance

- `npm run build` and automated tests pass.
- The rendered iframe loads without application errors, initializes WebGL, and presents the full seven-volume shelf interface.
- Desktop and mobile viewport checks confirm responsive layout and usable authored interactions.
