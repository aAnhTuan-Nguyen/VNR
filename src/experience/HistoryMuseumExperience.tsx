import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import {
  HISTORY_CHAPTERS,
  HISTORY_SOURCE_LIST,
  getChapter,
  type ChapterId,
  type HistoryChapter,
  type MediaCredit,
} from "../content/history";
import { MuseumScene, type MuseumQuality } from "./MuseumScene";
import {
  initialMuseumState,
  museumReducer,
  type MuseumState,
} from "./museumState";

interface HistoryMuseumExperienceProps {
  initialChapter?: ChapterId;
  presentationMode?: boolean;
  muted?: boolean;
}

interface SceneErrorBoundaryProps {
  children: ReactNode;
  onError: () => void;
}

interface SceneErrorBoundaryState {
  failed: boolean;
}

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  state: SceneErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function browserHasWebGL(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

function getQuality(): MuseumQuality {
  if (typeof window === "undefined") {
    return { dpr: 1, shadows: false, shadowMapSize: 512, dustCount: 26 };
  }
  const narrowViewport = window.matchMedia?.("(max-width: 900px)").matches ?? false;
  const lowMemory = typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4;
  const lowTier = narrowViewport || lowMemory;
  return {
    dpr: Math.min(window.devicePixelRatio || 1, lowTier ? 1.15 : 1.65),
    shadows: !lowTier,
    shadowMapSize: lowTier ? 512 : 1024,
    dustCount: lowTier ? 28 : 74,
  };
}

class Soundscape {
  private context: AudioContext | null = null;

  private master: GainNode | null = null;

  private ambience: OscillatorNode | null = null;

  private enabled = false;

  enable() {
    if (typeof window === "undefined") return;
    const AudioContextConstructor = window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;

    if (!this.context) {
      this.context = new AudioContextConstructor();
      this.master = this.context.createGain();
      this.master.gain.value = 0.045;
      this.master.connect(this.context.destination);
      this.ambience = this.context.createOscillator();
      this.ambience.type = "sine";
      this.ambience.frequency.value = 74;
      this.ambience.connect(this.master);
      this.ambience.start();
    }
    void this.context.resume();
    this.enabled = true;
    if (this.master) this.master.gain.setTargetAtTime(0.045, this.context.currentTime, 0.12);
  }

  disable() {
    this.enabled = false;
    if (this.master && this.context) this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.08);
  }

  pageTurn() {
    if (!this.enabled || !this.context || !this.master) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(220, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(92, this.context.currentTime + 0.16);
    gain.gain.setValueAtTime(0.0001, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, this.context.currentTime + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.18);
    oscillator.connect(gain).connect(this.master);
    oscillator.start();
    oscillator.stop(this.context.currentTime + 0.2);
  }

  click() {
    if (!this.enabled || !this.context || !this.master) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 520;
    gain.gain.setValueAtTime(0.0001, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.11, this.context.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.1);
    oscillator.connect(gain).connect(this.master);
    oscillator.start();
    oscillator.stop(this.context.currentTime + 0.12);
  }

  dispose() {
    this.ambience?.stop();
    void this.context?.close();
    this.context = null;
    this.master = null;
    this.ambience = null;
  }
}

function MuseumCanvas({
  chapter,
  state,
  quality,
  reducedMotion,
  onOpenArtifact,
  onSwipe,
  onError,
}: {
  chapter: HistoryChapter;
  state: MuseumState;
  quality: MuseumQuality;
  reducedMotion: boolean;
  onOpenArtifact: (artifactIndex: number) => void;
  onSwipe: (direction: "next" | "previous") => void;
  onError: () => void;
}) {
  return (
    <SceneErrorBoundary onError={onError}>
      <Canvas
        className="museum-canvas"
        shadows={quality.shadows}
        dpr={quality.dpr}
        camera={{ fov: 34, near: 0.1, far: 30, position: [0, 2.8, 8.9] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <Suspense fallback={null}>
          <MuseumScene
            chapter={chapter}
            pageIndex={state.pageIndex}
            mode={state.mode}
            quality={quality}
            reducedMotion={reducedMotion}
            onOpenArtifact={onOpenArtifact}
            onSwipe={onSwipe}
          />
        </Suspense>
      </Canvas>
    </SceneErrorBoundary>
  );
}

function IntroScreen({ chapter, onStart }: { chapter: HistoryChapter; onStart: () => void }) {
  return (
    <div className="museum-intro museum-panel-glass">
      <div className="museum-intro-copy">
        <p className="museum-eyebrow"><span>ARCHIVE / 03</span><span>TRẢI NGHIỆM TƯƠNG TÁC</span></p>
        <h1 aria-label="Bảo tàng lưu trữ 3D">Bảo tàng<br /><em>lưu trữ 3D</em></h1>
        <p className="museum-lede">Một cuốn sách mở ra sáu lát cắt lịch sử — nơi ký ức, hiện vật và lựa chọn của thế hệ hôm nay gặp nhau trong một phòng lưu trữ sống.</p>
        <button className="museum-primary-button" type="button" onClick={onStart} data-testid="start-tour">
          Bắt đầu tham quan <span aria-hidden="true">↗</span>
        </button>
        <p className="museum-hint">Âm thanh sẽ mở sau thao tác đầu tiên · Kéo chuột để nhìn quanh</p>
      </div>
      <div className="museum-intro-card">
        <div className="museum-intro-card-image">
          <img src={chapter.heroImage.localPath} alt={chapter.heroImage.alt} />
          <span>01 / 06</span>
        </div>
        <div className="museum-intro-card-meta">
          <span>{chapter.period}</span>
          <strong>{chapter.title}</strong>
          <small>Ảnh tư liệu · {chapter.heroImage.license.split("(")[0].trim()}</small>
        </div>
      </div>
    </div>
  );
}

function OverviewPanel({ onChoose }: { onChoose: (chapterId: ChapterId) => void }) {
  return (
    <div className="museum-overview museum-panel-glass">
      <div>
        <p className="museum-eyebrow">PHÒNG ĐỌC / 00</p>
        <h2>Một cuốn sách,<br /><em>sáu thời đoạn.</em></h2>
        <p className="museum-overview-copy">Chọn một mốc trên đường thời gian để bước vào chương tương ứng. Mỗi trang là một câu hỏi ngắn: điều gì đã được xây dựng, bảo vệ và trao lại?</p>
      </div>
      <div className="museum-overview-grid">
        {HISTORY_CHAPTERS.map((chapter, index) => (
          <button key={chapter.id} type="button" className="museum-chapter-teaser" onClick={() => onChoose(chapter.id)} data-testid={`overview-${chapter.id}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{chapter.period}</strong>
            <small>{chapter.title}</small>
            <i style={{ backgroundColor: chapter.accent }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ChapterPanel({
  chapter,
  pageIndex,
  onOpenArtifact,
  onPage,
}: {
  chapter: HistoryChapter;
  pageIndex: number;
  onOpenArtifact: (artifactIndex: number) => void;
  onPage: (direction: "next" | "previous") => void;
}) {
  return (
    <div className="museum-chapter-layout">
      <article className="museum-chapter-copy museum-panel-glass">
        <p className="museum-eyebrow"><span>CHƯƠNG {String(HISTORY_CHAPTERS.findIndex((item) => item.id === chapter.id) + 1).padStart(2, "0")}</span><span>{chapter.lightingPreset.toUpperCase()}</span></p>
        <p className="museum-period">{chapter.period}</p>
        <h2>{chapter.title}</h2>
        <p className="museum-summary">{chapter.summary}</p>
        <ol className="museum-key-points">
          {chapter.keyPoints.map((point) => <li key={point}>{point}</li>)}
        </ol>
        <div className="museum-takeaway">
          <span>BÀI HỌC LỊCH SỬ</span>
          <p>{chapter.takeaway}</p>
        </div>
        <div className="museum-page-controls" aria-label="Điều khiển lật trang">
          <button type="button" onClick={() => onPage("previous")} disabled={pageIndex === 0} aria-label="Trang trước">←</button>
          <span><b>{String(pageIndex + 1).padStart(2, "0")}</b> / 06</span>
          <button type="button" onClick={() => onPage("next")} disabled={pageIndex === 5} aria-label="Trang tiếp theo">→</button>
        </div>
      </article>
      <aside className="museum-artifact-rail">
        <p className="museum-rail-label">MỞ HỒ SƠ / 02 TƯ LIỆU</p>
        <ArtifactCard index={1} media={chapter.supportingMedia[0]} onOpen={onOpenArtifact} />
        <ArtifactCard index={2} media={chapter.supportingMedia[1]} onOpen={onOpenArtifact} />
        <p className="museum-rail-note">Bấm vào ảnh để phóng to và xem nguồn. Ảnh đã được lưu cục bộ cho bản trình chiếu offline.</p>
      </aside>
    </div>
  );
}

function ArtifactCard({ index, media, onOpen }: { index: number; media: MediaCredit; onOpen: (index: number) => void }) {
  return (
    <button type="button" className="museum-artifact-card" onClick={() => onOpen(index)} data-testid={`artifact-${index}`}>
      <span className="museum-artifact-image"><img src={media.localPath} alt={media.alt} /><i aria-hidden="true">↗</i></span>
      <span className="museum-artifact-info"><small>{media.date}</small><strong>{media.title}</strong><em>{media.creator}</em></span>
    </button>
  );
}

function ArtifactModal({ media, onClose }: { media: MediaCredit; onClose: () => void }) {
  return (
    <div className="museum-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="museum-artifact-modal" role="dialog" aria-modal="true" aria-labelledby="artifact-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="museum-modal-close" onClick={onClose} aria-label="Đóng tư liệu">×</button>
        <div className="museum-modal-image"><img src={media.localPath} alt={media.alt} /></div>
        <div className="museum-modal-copy">
          <p className="museum-eyebrow">TƯ LIỆU PHÓNG TO</p>
          <h2 id="artifact-title">{media.title}</h2>
          <p>{media.alt}</p>
          <dl>
            <div><dt>Ngày</dt><dd>{media.date}</dd></div>
            <div><dt>Tác giả</dt><dd>{media.creator}</dd></div>
            <div><dt>Giấy phép</dt><dd>{media.license}</dd></div>
          </dl>
          <a href={media.sourceUrl} target="_blank" rel="noreferrer">Mở trang nguồn ↗</a>
        </div>
      </div>
    </div>
  );
}

function CreditsPanel({ onClose }: { onClose: () => void }) {
  const uniqueMedia = useMemo(() => {
    const map = new Map<string, MediaCredit>();
    HISTORY_CHAPTERS.forEach((chapter) => {
      [chapter.heroImage, ...chapter.supportingMedia].forEach((item) => map.set(item.localPath, item));
    });
    return Array.from(map.values());
  }, []);

  return (
    <div className="museum-credits museum-panel-glass">
      <div className="museum-credits-heading">
        <div>
          <p className="museum-eyebrow">PHÒNG ĐỌC / SOURCES</p>
          <h2>Để ký ức<br /><em>có địa chỉ.</em></h2>
        </div>
        <button type="button" className="museum-secondary-button" onClick={onClose}>Quay lại phòng đọc</button>
      </div>
      <div className="museum-credits-columns">
        <div>
          <p className="museum-credits-label">NỘI DUNG ĐỐI CHIẾU</p>
          <ul className="museum-source-list">
            {HISTORY_SOURCE_LIST.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></li>)}
          </ul>
          <p className="museum-credits-disclaimer">Nội dung trong trải nghiệm được viết lại ở dạng tóm tắt phục vụ thuyết trình, không thay thế tài liệu học tập. Hình ảnh lịch sử không được tạo bằng AI.</p>
        </div>
        <div>
          <p className="museum-credits-label">DANH MỤC ẢNH / {String(uniqueMedia.length).padStart(2, "0")}</p>
          <ul className="museum-media-list">
            {uniqueMedia.map((item) => <li key={item.localPath}><strong>{item.title}</strong><span>{item.creator} · {item.license}</span></li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Timeline({ activeId, onSelect, onCredits }: { activeId: ChapterId; onSelect: (chapterId: ChapterId) => void; onCredits: () => void }) {
  return (
    <div className="museum-timeline-wrap">
      <nav className="museum-timeline" aria-label="Dòng thời gian lịch sử Đảng">
        <div className="museum-timeline-line" />
        {HISTORY_CHAPTERS.map((chapter, index) => (
          <button key={chapter.id} type="button" className={`museum-timeline-item ${chapter.id === activeId ? "is-active" : ""}`} onClick={() => onSelect(chapter.id)} aria-label={`Mở chương ${chapter.period}`} data-testid={`timeline-${chapter.id}`}>
            <span className="museum-timeline-dot" style={{ borderColor: chapter.accent }} />
            <strong>{chapter.period}</strong>
            <small>{String(index + 1).padStart(2, "0")} / {chapter.title}</small>
          </button>
        ))}
      </nav>
      <button type="button" className="museum-credits-link" onClick={onCredits}>Nguồn & giấy phép ↗</button>
    </div>
  );
}

function MuseumFallback({ chapter, onOpenArtifact }: { chapter: HistoryChapter; onOpenArtifact: (index: number) => void }) {
  return (
    <div className="museum-fallback" aria-live="polite">
      <div className="museum-fallback-art"><img src={chapter.heroImage.localPath} alt={chapter.heroImage.alt} /></div>
      <div><p className="museum-eyebrow">CHẾ ĐỘ TƯƠNG THÍCH 2D</p><h2>{chapter.period}<br />{chapter.title}</h2><p>WebGL hoặc mô hình 3D không khả dụng trên thiết bị này. Nội dung lưu trữ vẫn có thể xem theo dòng thời gian.</p><button type="button" className="museum-secondary-button" onClick={() => onOpenArtifact(1)}>Mở tư liệu</button></div>
    </div>
  );
}

export function HistoryMuseumExperience({
  initialChapter,
  presentationMode = false,
  muted = false,
}: HistoryMuseumExperienceProps) {
  const [state, dispatch] = useReducer(museumReducer, {
    ...initialMuseumState,
    chapterId: initialChapter ?? initialMuseumState.chapterId,
  });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [hasWebGL] = useState(browserHasWebGL);
  const quality = useMemo(getQuality, []);
  const soundscape = useMemo(() => new Soundscape(), []);
  const chapter = getChapter(state.chapterId);
  const artifact = state.artifactIndex === null
    ? null
    : state.artifactIndex === 0
      ? chapter.heroImage
      : chapter.supportingMedia[Math.min(state.artifactIndex - 1, 1)];

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(Boolean(mediaQuery?.matches));
    update();
    mediaQuery?.addEventListener?.("change", update);
    return () => mediaQuery?.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (muted || !state.audioEnabled) soundscape.disable();
    else soundscape.enable();
  }, [muted, soundscape, state.audioEnabled]);

  useEffect(() => () => soundscape.dispose(), [soundscape]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (state.artifactIndex !== null) dispatch({ type: "closeArtifact" });
        else if (state.mode === "credits") dispatch({ type: "closeCredits" });
      }
      if (state.mode === "intro" && event.key === "Enter") dispatch({ type: "start" });
      if (state.mode === "chapter" && event.key === "ArrowRight") {
        dispatch({ type: "nextPage" });
        soundscape.pageTurn();
      }
      if (state.mode === "chapter" && event.key === "ArrowLeft") {
        dispatch({ type: "previousPage" });
        soundscape.pageTurn();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [soundscape, state.artifactIndex, state.mode]);

  const start = () => {
    dispatch({ type: "start" });
    soundscape.enable();
    soundscape.click();
  };
  const selectChapter = (chapterId: ChapterId) => {
    dispatch({ type: "selectChapter", chapterId });
    soundscape.click();
  };
  const page = (direction: "next" | "previous") => {
    dispatch({ type: direction === "next" ? "nextPage" : "previousPage" });
    soundscape.pageTurn();
  };

  return (
    <main
      className={`museum-experience ${presentationMode ? "is-presentation" : ""}`}
      data-testid="history-museum-experience"
      data-mode={state.mode}
      style={{ "--museum-accent": chapter.accent } as React.CSSProperties}
    >
      <div className="museum-canvas-layer">
        {hasWebGL && !sceneFailed ? (
          <MuseumCanvas chapter={chapter} state={state} quality={quality} reducedMotion={reducedMotion} onOpenArtifact={(index) => dispatch({ type: "openArtifact", artifactIndex: index })} onSwipe={page} onError={() => setSceneFailed(true)} />
        ) : (
          <MuseumFallback chapter={chapter} onOpenArtifact={(index) => dispatch({ type: "openArtifact", artifactIndex: index })} />
        )}
      </div>
      <header className="museum-topbar">
        <div className="museum-brand"><span className="museum-brand-mark">◒</span><span>VIỆT NAM<br /><b>ARCHIVE / 3D</b></span></div>
        <div className="museum-topbar-status"><span className="museum-status-dot" /> PHÒNG LƯU TRỮ · OFFLINE BUILD</div>
        <div className="museum-topbar-actions">
          <button type="button" onClick={() => dispatch({ type: "toggleAudio" })} aria-label={state.audioEnabled ? "Tắt âm thanh" : "Bật âm thanh"} className="museum-icon-button">{state.audioEnabled && !muted ? "◉" : "○"}<span>{state.audioEnabled && !muted ? "Âm thanh" : "Im lặng"}</span></button>
          <button type="button" className="museum-icon-button" onClick={() => dispatch({ type: "showCredits" })}><span>Nguồn</span> ↗</button>
        </div>
      </header>
      {state.mode === "intro" && <IntroScreen chapter={chapter} onStart={start} />}
      {state.mode === "overview" && <OverviewPanel onChoose={selectChapter} />}
      {state.mode === "chapter" && <ChapterPanel chapter={chapter} pageIndex={state.pageIndex} onOpenArtifact={(index) => dispatch({ type: "openArtifact", artifactIndex: index })} onPage={page} />}
      {state.mode === "credits" && <CreditsPanel onClose={() => dispatch({ type: "closeCredits" })} />}
      {artifact && <ArtifactModal media={artifact} onClose={() => dispatch({ type: "closeArtifact" })} />}
      {state.mode !== "intro" && state.mode !== "credits" && <Timeline activeId={state.chapterId} onSelect={selectChapter} onCredits={() => dispatch({ type: "showCredits" })} />}
      <div className="museum-cursor-note" aria-hidden="true">DRAG TO EXPLORE <span>•</span> CLICK TO OPEN</div>
    </main>
  );
}
