import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GlossaryPage } from "@/components/GlossaryPage";

describe("GlossaryPage", () => {
  it("renders the glossary title and sample terms", () => {
    render(<GlossaryPage />);
    expect(screen.getByTestId("glossary-page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Glossary" })
    ).toBeInTheDocument();
    expect(screen.getByText("Ticker symbol")).toBeInTheDocument();
    expect(screen.getByText("ETF (exchange-traded fund)")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Cryptocurrency" })
    ).toBeInTheDocument();
    expect(screen.getByText("RSI (Relative Strength Index)")).toBeInTheDocument();
  });
});
