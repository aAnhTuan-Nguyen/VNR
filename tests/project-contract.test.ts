import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");

describe("Complete Shelf project contract", () => {
  it("uses the configured authored CompleteShelfLandingPage and preserves ThreeUI styling", () => {
    const scenePath = path.join(projectRoot, "src", "Scene.tsx");
    expect(existsSync(scenePath)).toBe(true);
    const source = readFileSync(scenePath, "utf8");
    expect(source).toContain('import "@designcodeio/threeui/style.css"');
    expect(source).toContain('import { CompleteShelfLandingPage } from "@designcodeio/threeui"');
    expect(source).toContain("<CompleteShelfLandingPage");
    expect(source).toContain('headingFont="iowan-old-style"');
    expect(source).toContain('primaryColor="#c87046"');
    expect(source).toContain("srcDoc={historyLibrary}");
    expect(source).not.toContain("<HistoryArchiveOverlay />");
  });

  it("stores the byte-exact canonical HTML", () => {
    const htmlPath = path.join(projectRoot, "public", "landing-pages", "complete-shelf-v2.html");
    expect(existsSync(htmlPath)).toBe(true);
    const digest = createHash("sha256").update(readFileSync(htmlPath)).digest("hex");
    expect(digest).toBe("606f200fed8602c243f40a11c8c364f0e625c57f80e7c97dc76419da207f198e");
  });
});
