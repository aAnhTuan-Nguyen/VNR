import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Scene } from "../src/Scene";

describe("Scene", () => {
  it("renders the authored ThreeUI component with the local history document", () => {
    render(<Scene />);

    const iframe = screen.getByTitle("Dòng Lịch Sử · Kệ sách tương tác");
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute("srcdoc")).toContain("Hành trình tìm đường");
    expect(iframe).not.toHaveAttribute("src");
  });
});
