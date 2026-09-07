import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { HISTORY_CHAPTERS } from "../src/content/history";

describe("offline museum assets", () => {
  it("ships every catalog image inside public/assets/museum", () => {
    const projectRoot = path.resolve(import.meta.dirname, "..");
    for (const chapter of HISTORY_CHAPTERS) {
      for (const media of [chapter.heroImage, ...chapter.supportingMedia]) {
        expect(existsSync(path.join(projectRoot, "public", media.localPath))).toBe(true);
      }
    }
    expect(existsSync(path.join(projectRoot, "public", "assets/museum/archive-wall-texture.png"))).toBe(true);
  });
});
