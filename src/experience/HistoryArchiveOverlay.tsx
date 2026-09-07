import { useEffect, useMemo, useState } from "react";

import {
  HISTORY_CHAPTERS,
  HISTORY_SOURCE_LIST,
  type ChapterId,
  type HistoryChapter,
  type MediaCredit,
} from "../content/history";

interface HistoryArchiveOverlayProps {
  initialChapter?: ChapterId;
}

function chapterNumber(chapter: HistoryChapter) {
  return String(HISTORY_CHAPTERS.findIndex((item) => item.id === chapter.id) + 1).padStart(2, "0");
}

function ArtifactLightbox({ media, onClose }: { media: MediaCredit; onClose: () => void }) {
  return (
    <div className="archive-lightbox" role="presentation" onClick={onClose}>
      <section
        className="archive-lightbox__inner"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-lightbox-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="archive-close" type="button" onClick={onClose} aria-label="Đóng tư liệu">
          <span aria-hidden="true">×</span>
        </button>
        <div className="archive-lightbox__image">
          <img src={media.localPath} alt={media.alt} />
        </div>
        <div className="archive-lightbox__copy">
          <p className="archive-kicker">TƯ LIỆU / PHÓNG TO</p>
          <h2 id="archive-lightbox-title">{media.title}</h2>
          <p>{media.alt}</p>
          <dl>
            <div><dt>Ngày</dt><dd>{media.date}</dd></div>
            <div><dt>Tác giả</dt><dd>{media.creator}</dd></div>
            <div><dt>Giấy phép</dt><dd>{media.license}</dd></div>
          </dl>
          <a href={media.sourceUrl} target="_blank" rel="noreferrer">Mở trang nguồn ↗</a>
        </div>
      </section>
    </div>
  );
}

function SourcesView({ onBack }: { onBack: () => void }) {
  return (
    <div className="archive-sources-view">
      <div className="archive-view-heading">
        <div>
          <p className="archive-kicker">PHÒNG ĐỌC / NGUỒN</p>
          <h2>Để ký ức<br /><em>có địa chỉ.</em></h2>
        </div>
        <button className="archive-text-button" type="button" onClick={onBack}>Quay lại chương</button>
      </div>

      <div className="archive-sources-grid">
        <div>
          <p className="archive-label">NỘI DUNG ĐỐI CHIẾU</p>
          <ul className="archive-source-list">
            {HISTORY_SOURCE_LIST.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">{source.title} <span>↗</span></a>
              </li>
            ))}
          </ul>
          <p className="archive-note">Nội dung được viết lại dạng tóm tắt phục vụ thuyết trình. Hình ảnh lịch sử không được tạo bằng AI.</p>
        </div>
        <div>
          <p className="archive-label">NGUYÊN TẮC LƯU TRỮ</p>
          <p className="archive-source-copy">Ảnh tư liệu trong trải nghiệm được lưu cục bộ để trình chiếu offline. Mỗi ảnh giữ lại trang nguồn, tác giả, niên đại và giấy phép để có thể kiểm tra lại.</p>
          <p className="archive-source-copy">Các lớp giấy, vải, ánh sáng và họa tiết trong scene là phần trình bày sáng tạo; không được xem là hiện vật lịch sử.</p>
        </div>
      </div>
    </div>
  );
}

function ChapterView({ chapter, onArtifact }: { chapter: HistoryChapter; onArtifact: (media: MediaCredit) => void }) {
  return (
    <>
      <div className="archive-chapter-grid">
        <button className="archive-hero" type="button" onClick={() => onArtifact(chapter.heroImage)} aria-label={`Phóng to ${chapter.heroImage.title}`}>
          <img src={chapter.heroImage.localPath} alt={chapter.heroImage.alt} />
          <span className="archive-hero__label">ẢNH CHÍNH <b>↗</b></span>
        </button>
        <article className="archive-chapter-copy">
          <p className="archive-period">{chapter.period}</p>
          <h2>{chapter.title}</h2>
          <p className="archive-summary">{chapter.summary}</p>
          <ol className="archive-points">
            {chapter.keyPoints.map((point) => <li key={point}>{point}</li>)}
          </ol>
          <blockquote>
            <span>BÀI HỌC LỊCH SỬ</span>
            <p>{chapter.takeaway}</p>
          </blockquote>
        </article>
      </div>

      <div className="archive-supporting">
        <div className="archive-supporting__heading">
          <p className="archive-label">HỒ SƠ LIÊN QUAN</p>
          <span>02 TƯ LIỆU</span>
        </div>
        <div className="archive-supporting__grid">
          {chapter.supportingMedia.map((media) => (
            <button className="archive-media-card" type="button" key={media.localPath} onClick={() => onArtifact(media)}>
              <span className="archive-media-card__image"><img src={media.localPath} alt={media.alt} /><i aria-hidden="true">↗</i></span>
              <span className="archive-media-card__meta"><b>{media.date}</b><strong>{media.title}</strong><small>{media.creator}</small></span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function HistoryArchiveOverlay({ initialChapter = "preparation" }: HistoryArchiveOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [chapterId, setChapterId] = useState<ChapterId>(initialChapter);
  const [artifact, setArtifact] = useState<MediaCredit | null>(null);
  const chapter = useMemo(
    () => HISTORY_CHAPTERS.find((item) => item.id === chapterId) ?? HISTORY_CHAPTERS[0],
    [chapterId],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (artifact) setArtifact(null);
      else if (showSources) setShowSources(false);
      else if (isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [artifact, isOpen, showSources]);

  const chooseChapter = (id: ChapterId) => {
    setChapterId(id);
    setShowSources(false);
  };

  return (
    <div className="history-archive-overlay" data-testid="history-archive-overlay">
      <div className="archive-bridge">
        <span className="archive-bridge__index">ARCHIVE / 03</span>
        <button type="button" className="archive-bridge__button" onClick={() => setIsOpen(true)} data-testid="history-archive-trigger">
          <strong>Lịch sử Đảng</strong>
          <span>Sáu chương · một dòng chảy ↗</span>
        </button>
      </div>

      {isOpen && (
        <div className="archive-overlay" role="presentation" onClick={() => setIsOpen(false)}>
          <section className="archive-panel" role="dialog" aria-modal="true" aria-labelledby="archive-title" onClick={(event) => event.stopPropagation()}>
            <header className="archive-panel__header">
              <div>
                <p className="archive-kicker">VIỆT NAM / LƯU TRỮ TƯƠNG TÁC</p>
                <h1 id="archive-title">Lịch sử <em>Đảng</em></h1>
              </div>
              <div className="archive-panel__header-meta">
                <span>06 chương</span>
                <button className="archive-close archive-close--panel" type="button" onClick={() => setIsOpen(false)} aria-label="Đóng kho tư liệu">×</button>
              </div>
            </header>

            <nav className="archive-timeline" aria-label="Dòng thời gian lịch sử Đảng">
              {HISTORY_CHAPTERS.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  className={`archive-timeline__item ${item.id === chapter.id ? "is-active" : ""}`}
                  onClick={() => chooseChapter(item.id)}
                  data-testid={`archive-chapter-${item.id}`}
                >
                  <span className="archive-timeline__dot" style={{ borderColor: item.accent }} />
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <strong>{item.period}</strong>
                </button>
              ))}
            </nav>

            {showSources ? (
              <SourcesView onBack={() => setShowSources(false)} />
            ) : (
              <>
                <div className="archive-chapter-heading">
                  <div><span>CHƯƠNG {chapterNumber(chapter)}</span><b>{chapter.lightingPreset.toUpperCase()}</b></div>
                  <p>Chọn ảnh để phóng to · kéo sách trong nền để khám phá ThreeUI</p>
                </div>
                <ChapterView chapter={chapter} onArtifact={setArtifact} />
              </>
            )}

            <footer className="archive-panel__footer">
              <span>HÌNH ẢNH ĐÃ LƯU CỤC BỘ / TRÌNH CHIẾU OFFLINE</span>
              <button type="button" className="archive-text-button" onClick={() => setShowSources(!showSources)}>{showSources ? "Quay lại chương" : "Nguồn & giấy phép ↗"}</button>
            </footer>
          </section>
        </div>
      )}

      {artifact && <ArtifactLightbox media={artifact} onClose={() => setArtifact(null)} />}
    </div>
  );
}
