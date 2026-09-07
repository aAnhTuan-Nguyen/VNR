import "@designcodeio/threeui/style.css";
import { CompleteShelfLandingPage } from "@designcodeio/threeui";
import { useEffect, useRef } from "react";
import historyLibrary from "./experience/generated/history-library.html?raw";
import "./experience/library-frame.css";

export function Scene() {
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const iframe = frame.current?.querySelector("iframe");
    if (iframe) iframe.title = "Dòng Lịch Sử · Kệ sách tương tác";
  }, []);
  return (
    <div ref={frame} className="shader-frame threeui-history-stage">
      <CompleteShelfLandingPage
        srcDoc={historyLibrary}
        headingFont="iowan-old-style"
        bodyFont="inter"
        headingWeight="400"
        bodyWeight="400"
        primaryColor="#c87046"
        headingSize={60}
        bodySize={12}
        headingLetterSpacing={-0.055}
      />
    </div>
  );
}
