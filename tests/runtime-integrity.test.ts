import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const packageRoot = path.join(projectRoot, "node_modules", "@designcodeio", "threeui");

describe("installed ThreeUI runtime", () => {
  it("is pinned to the reviewed package release", () => {
    const metadata = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));

    expect(metadata.version).toBe("1.2.0");
  });

  it("exports Complete Shelf with the registered title and canonical URL", () => {
    const runtime = readFileSync(
      path.join(packageRoot, "lib-dist", "shaders", "landing-pages", "LandingPages.js"),
      "utf8",
    );

    expect(runtime).toContain("Working Volumes — Seven Tools for Making");
    expect(runtime).toContain("/landing-pages/complete-shelf-v2.html");
  });

  it("ships the same canonical document as the registered source", () => {
    const packagedHtml = readFileSync(
      path.join(packageRoot, "lib-dist", "assets", "landing-pages", "complete-shelf-v2.html"),
    );
    const digest = createHash("sha256").update(packagedHtml).digest("hex");

    expect(digest).toBe("606f200fed8602c243f40a11c8c364f0e625c57f80e7c97dc76419da207f198e");
  });
});
