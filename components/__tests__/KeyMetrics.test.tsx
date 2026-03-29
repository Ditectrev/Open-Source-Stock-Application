/**
 * Unit tests for KeyMetrics component
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KeyMetrics } from "../KeyMetrics";
import { SymbolData } from "@/types";

// Mock theme context
vi.mock("@/lib/theme-context", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

describe("KeyMetrics", () => {
  const mockSymbolData: SymbolData = {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 150.25,
    change: 2.5,
    changePercent: 1.69,
    marketCap: 2500000000000, // 2.5T
    volume: 50000000, // 50M
    fiftyTwoWeekHigh: 180.0,
    fiftyTwoWeekLow: 120.0,
    lastUpdated: new Date("2024-01-15T10:30:00Z"),
  };

  it("should render all key metrics", () => {
    render(<KeyMetrics symbolData={mockSymbolData} />);

    expect(screen.getByText("Market Cap")).toBeInTheDocument();
    expect(screen.getByText("Volume")).toBeInTheDocument();
    expect(screen.getByText("52-Week High")).toBeInTheDocument();
    expect(screen.getByText("52-Week Low")).toBeInTheDocument();
    expect(screen.getByText("52-Week Range")).toBeInTheDocument();
  });

  it("should format market cap correctly", () => {
    render(<KeyMetrics symbolData={mockSymbolData} />);

    expect(screen.getByText("$2.50T")).toBeInTheDocument();
  });

  it("should format volume correctly", () => {
    render(<KeyMetrics symbolData={mockSymbolData} />);

    expect(screen.getByText("50.00M")).toBeInTheDocument();
  });

  it("should display 52-week high", () => {
    render(<KeyMetrics symbolData={mockSymbolData} />);

    expect(screen.getByText("$180.00")).toBeInTheDocument();
  });

  it("should display 52-week low", () => {
    render(<KeyMetrics symbolData={mockSymbolData} />);

    expect(screen.getByText("$120.00")).toBeInTheDocument();
  });

  it("should display 52-week range", () => {
    render(<KeyMetrics symbolData={mockSymbolData} />);

    expect(screen.getByText("$120.00 - $180.00")).toBeInTheDocument();
  });

  it("should show tooltip on hover", () => {
    render(<KeyMetrics symbolData={mockSymbolData} />);

    const marketCapCards = screen.getAllByText("Market Cap");
    const marketCapCard = marketCapCards[0].closest("div");

    if (marketCapCard) {
      fireEvent.mouseEnter(marketCapCard);

      expect(
        screen.getByText(/Market Capitalization is the total value/)
      ).toBeInTheDocument();
    }
  });

  it("should hide tooltip on mouse leave", () => {
    render(<KeyMetrics symbolData={mockSymbolData} />);

    const marketCapCards = screen.getAllByText("Market Cap");
    const marketCapCard = marketCapCards[0].closest("div");

    if (marketCapCard) {
      fireEvent.mouseEnter(marketCapCard);
      expect(
        screen.getByText(/Market Capitalization is the total value/)
      ).toBeInTheDocument();

      fireEvent.mouseLeave(marketCapCard);
      expect(
        screen.queryByText(/Market Capitalization is the total value/)
      ).not.toBeInTheDocument();
    }
  });

  it("should format billions correctly", () => {
    const billionData: SymbolData = {
      ...mockSymbolData,
      marketCap: 50000000000, // 50B
    };

    render(<KeyMetrics symbolData={billionData} />);

    expect(screen.getByText("$50.00B")).toBeInTheDocument();
  });

  it("should format millions correctly", () => {
    const millionData: SymbolData = {
      ...mockSymbolData,
      marketCap: 500000000, // 500M
    };

    render(<KeyMetrics symbolData={millionData} />);

    expect(screen.getByText("$500.00M")).toBeInTheDocument();
  });

  it("should format volume in billions", () => {
    const highVolumeData: SymbolData = {
      ...mockSymbolData,
      volume: 2000000000, // 2B
    };

    render(<KeyMetrics symbolData={highVolumeData} />);

    expect(screen.getByText("2.00B")).toBeInTheDocument();
  });
});
