import { describe, expect, it } from "vitest";

import {
  initialMuseumState,
  museumReducer,
} from "../src/experience/museumState";

describe("museum interaction state", () => {
  it("moves from the foyer to the overview after starting the tour", () => {
    const next = museumReducer(initialMuseumState, { type: "start" });

    expect(next.mode).toBe("overview");
    expect(next.audioEnabled).toBe(true);
  });

  it("selects chapters and clamps page navigation", () => {
    const chapter = museumReducer(initialMuseumState, {
      type: "start",
    });
    const selected = museumReducer(chapter, {
      type: "selectChapter",
      chapterId: "reunification",
    });
    const previous = museumReducer(selected, { type: "previousPage" });
    const next = museumReducer(previous, { type: "nextPage" });

    expect(selected.chapterId).toBe("reunification");
    expect(previous.pageIndex).toBe(0);
    expect(next.pageIndex).toBe(1);
  });

  it("opens and closes an artifact while preserving the selected chapter", () => {
    const selected = museumReducer(initialMuseumState, {
      type: "selectChapter",
      chapterId: "integration",
    });
    const opened = museumReducer(selected, {
      type: "openArtifact",
      artifactIndex: 1,
    });
    const closed = museumReducer(opened, { type: "closeArtifact" });

    expect(opened.artifactIndex).toBe(1);
    expect(closed.artifactIndex).toBeNull();
    expect(closed.chapterId).toBe("integration");
  });
});
