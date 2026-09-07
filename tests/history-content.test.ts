import { describe, expect, it } from "vitest";

import { HISTORY_CHAPTERS } from "../src/content/history";

describe("history museum catalog", () => {
  it("contains the six planned chapters in chronological order", () => {
    expect(HISTORY_CHAPTERS.map((chapter) => chapter.id)).toEqual([
      "preparation",
      "revolution",
      "resistance",
      "reunification",
      "renovation",
      "integration",
    ]);
  });

  it("has complete educational and media metadata for every chapter", () => {
    for (const chapter of HISTORY_CHAPTERS) {
      expect(chapter.keyPoints).toHaveLength(3);
      expect(chapter.supportingMedia).toHaveLength(2);

      for (const media of [chapter.heroImage, ...chapter.supportingMedia]) {
        expect(media.localPath).toMatch(/^\/assets\/museum\//);
        expect(media.sourceUrl).toMatch(/^https:\/\//);
        expect(media.license.length).toBeGreaterThan(3);
        expect(media.alt.length).toBeGreaterThan(10);
      }
    }
  });
});
