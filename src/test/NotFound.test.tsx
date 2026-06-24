import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

vi.mock("@phosphor-icons/react", () => ({
  Compass: () => null,
}));

import { NotFound } from "../components/NotFound";

describe("NotFound", () => {
  it("renders 404 heading and a home link", () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>,
    );
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
