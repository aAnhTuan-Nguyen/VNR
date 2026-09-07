import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const registered = [
  ["src/shaders/landing-pages/LandingPages.tsx", "7fdacf75a4715b0b6aea50a889422af9aa45f5c1771a7e1bbc59a6e2dd036704"],
  ["src/shaders/landing-pages/LandingPageFrame.tsx", "61de2cc50888aac4ac5557420b07fa47ed3543bb57c1e0055fafdefa53dbaa78"],
  ["public/landing-pages/complete-shelf-v2.html", "606f200fed8602c243f40a11c8c364f0e625c57f80e7c97dc76419da207f198e"],
  ["src/shaders/threeui.css", "efe4447139f1358dd8e9be68edf6fa46cbefbd1de423a4d6c439ca61d2c8eccf"],
] as const;

describe("registered ThreeUI source", () => {
  it.each(registered)("preserves %s", (relativePath, expectedHash) => {
    const bytes = readFileSync(path.join(projectRoot, relativePath));
    const actualHash = createHash("sha256").update(bytes).digest("hex");

    expect(actualHash).toBe(expectedHash);
  });
});
