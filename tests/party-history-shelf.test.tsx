import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Scene } from "../src/Scene";

describe("Party history shelf", () => {
  it("shares the physical pages and reader through the same catalog", () => {
    render(<Scene />);

    const document = screen.getByTitle("Dòng Lịch Sử · Kệ sách tương tác").getAttribute("srcdoc");
    expect(document).toContain('id="history-reader"');
    expect(document).toContain("visibleHistoryPages");
    expect(document).toContain("/assets/museum/runtime/three.module.js");
    expect(document).not.toContain("https://cdn.jsdelivr.net");
  });
});
