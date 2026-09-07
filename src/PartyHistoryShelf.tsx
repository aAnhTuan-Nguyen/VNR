import { useState } from "react";

const FRAME_SANDBOX =
  "allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts";

export function PartyHistoryShelf() {
  const [ready, setReady] = useState(false);

  return (
    <div
      className="threeui-background landing-page-frame party-history-shelf"
      data-state={ready ? "ready" : "loading"}
      style={{ position: "relative", overflow: "hidden", background: "#2b090d" }}
    >
      <iframe
        title="Thư viện 3D - Lịch sử Đảng"
        src="/landing-pages/lich-su-dang-shelf.html"
        sandbox={FRAME_SANDBOX}
        loading="eager"
        onLoad={() => setReady(true)}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          background: "#2b090d",
        }}
      />
    </div>
  );
}
