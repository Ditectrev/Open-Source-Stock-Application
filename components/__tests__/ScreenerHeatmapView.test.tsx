/**
 * ScreenerHeatmapView Component Tests
 * Tests for data conversion, empty state, tile click handling,
 * and HeatmapComponent integration.
 *
 * Requirements: 26.10, 26.11, 26.17
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScreenerHeatmapView } from "../ScreenerHeatmapView";
import type { ScreenerResult } from "@/types";

// ---------------------------------------------------------------------------
// Mock HeatmapComponent so we can inspect props without rendering the full
// heatmap (which depends on canvas/theme context).
// ---------------------------------------------------------------------------

let capturedProps: Record<string, unknown> = {};

vi.mock("../HeatmapComponent", () => ({
  HeatmapComponent: (props: Record<string, unknown>) => {
    capturedProps = props;
    const data = props.data as Array<{
      symbol: string;
      changePercent: number;
    }>;
    return (
      <div data-testid="mock-heatmap">
        {data.map((d) => (
          <button
            key={d.symbol}
            data-testid={`tile-${d.symbol}`}
            onClick={() => (props.onTileClick as (item: unknown) => void)?.(d)}
          >
            {d.symbol} {d.changePercent}%
          </button>
        ))}
      </div>
    );
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeResult(overrides: Partial<ScreenerResult> = {}): ScreenerResult {
  return {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    price: 180.5,
    changePercent: 1.25,
    volume: 50_000_000,
    marketCap: 2_800_000_000_000,
    peRatio: 28.5,
    valuationContext: "fair",
    matchScore: 85,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ScreenerHeatmapView", () => {
  // --- Empty state (Req 26.10) ---

  it("should show 'No results' when results array is empty", () => {
    render(<ScreenerHeatmapView results={[]} />);
    expect(screen.getByText("No results")).toBeDefined();
    expect(screen.getByTestId("screener-heatmap-empty")).toBeDefined();
  });

  it("should not render HeatmapComponent when results are empty", () => {
    render(<ScreenerHeatmapView results={[]} />);
    expect(screen.queryByTestId("mock-heatmap")).toBeNull();
  });

  // --- Data conversion & rendering (Req 26.10) ---

  it("should render HeatmapComponent with converted data", () => {
    const results = [
      makeResult({ symbol: "AAPL", price: 180, changePercent: 1.5 }),
      makeResult({ symbol: "MSFT", price: 400, changePercent: -0.8 }),
    ];
    render(<ScreenerHeatmapView results={results} />);

    expect(screen.getByTestId("mock-heatmap")).toBeDefined();
    expect(screen.getByTestId("tile-AAPL")).toBeDefined();
    expect(screen.getByTestId("tile-MSFT")).toBeDefined();
  });

  it("should convert ScreenerResult to HeatmapData correctly", () => {
    const results = [
      makeResult({
        symbol: "GOOG",
        name: "Alphabet Inc.",
        price: 150,
        changePercent: 2.3,
        sector: "Communication",
        marketCap: 1_900_000_000_000,
      }),
    ];
    render(<ScreenerHeatmapView results={results} />);

    const data = capturedProps.data as Array<Record<string, unknown>>;
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({
      symbol: "GOOG",
      name: "Alphabet Inc.",
      value: 150,
      changePercent: 2.3,
      sector: "Communication",
      marketCap: 1_900_000_000_000,
    });
  });

  // --- Tile click → onSymbolClick (Req 26.10) ---

  it("should call onSymbolClick when a tile is clicked", () => {
    const onClick = vi.fn();
    render(
      <ScreenerHeatmapView
        results={[makeResult({ symbol: "TSLA" })]}
        onSymbolClick={onClick}
      />
    );

    fireEvent.click(screen.getByTestId("tile-TSLA"));
    expect(onClick).toHaveBeenCalledWith("TSLA");
  });

  it("should not throw when tile clicked without onSymbolClick", () => {
    render(<ScreenerHeatmapView results={[makeResult({ symbol: "TSLA" })]} />);
    expect(() => {
      fireEvent.click(screen.getByTestId("tile-TSLA"));
    }).not.toThrow();
  });

  // --- Wrapper element ---

  it("should render wrapper with data-testid", () => {
    render(<ScreenerHeatmapView results={[makeResult()]} />);
    expect(screen.getByTestId("screener-heatmap-view")).toBeDefined();
  });
});
