import type { ChapterId } from "../content/history";

export type MuseumMode = "intro" | "overview" | "chapter" | "credits";

export interface MuseumState {
  mode: MuseumMode;
  chapterId: ChapterId;
  pageIndex: number;
  artifactIndex: number | null;
  audioEnabled: boolean;
  reducedMotion: boolean;
}

export type MuseumAction =
  | { type: "start" }
  | { type: "selectChapter"; chapterId: ChapterId }
  | { type: "nextPage" }
  | { type: "previousPage" }
  | { type: "openArtifact"; artifactIndex: number }
  | { type: "closeArtifact" }
  | { type: "toggleAudio" }
  | { type: "showCredits" }
  | { type: "closeCredits" };

export const initialMuseumState: MuseumState = {
  mode: "intro",
  chapterId: "preparation",
  pageIndex: 0,
  artifactIndex: null,
  audioEnabled: false,
  reducedMotion: false,
};

export function museumReducer(state: MuseumState, action: MuseumAction): MuseumState {
  switch (action.type) {
    case "start":
      return {
        ...state,
        mode: "overview",
        audioEnabled: true,
      };
    case "selectChapter":
      return {
        ...state,
        mode: "chapter",
        chapterId: action.chapterId,
        pageIndex: 0,
        artifactIndex: null,
      };
    case "nextPage":
      return {
        ...state,
        pageIndex: Math.min(5, state.pageIndex + 1),
      };
    case "previousPage":
      return {
        ...state,
        pageIndex: Math.max(0, state.pageIndex - 1),
      };
    case "openArtifact":
      return {
        ...state,
        mode: "chapter",
        artifactIndex: Math.max(0, Math.min(1, action.artifactIndex)),
      };
    case "closeArtifact":
      return {
        ...state,
        artifactIndex: null,
      };
    case "toggleAudio":
      return {
        ...state,
        audioEnabled: !state.audioEnabled,
      };
    case "showCredits":
      return {
        ...state,
        mode: "credits",
        artifactIndex: null,
      };
    case "closeCredits":
      return {
        ...state,
        mode: "overview",
      };
    default:
      return state;
  }
}
