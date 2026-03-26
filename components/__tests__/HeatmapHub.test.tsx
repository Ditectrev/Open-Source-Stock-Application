import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeatmapHub } from "@/components/HeatmapHub";

vi.mock("@/lib/theme-context", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: [] }),
  })
) as unknown as typeof fetch;

describe("HeatmapHub", () => {
  it("renders the heatmap hub with navigation", () => {
    render(<HeatmapHub />);
    expect(screen.getByTestId("heatmap-hub")).toBeInTheDocument();
    expect(screen.getByTestId("heatmap-navigation")).toBeInTheDocument();
  });

  it("defaults to ETF heatmap", () => {
    render(<HeatmapHub />);
    expect(
      screen.getByTestId("heatmap-tab-etf")
    ).toHaveAttribute("aria-selected", "true");
  });

  it("switches to crypto heatmap on tab click", () => {
    render(<HeatmapHub />);
    fireEvent.click(screen.getByTestId("heatmap-tab-crypto"));
    expect(
      screen.getByTestId("heatmap-tab-crypto")
    ).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByTestId("heatmap-tab-etf")
    ).toHaveAttribute("aria-selected", "false");
  });

  it("switches to stock heatmap on tab click", () => {
    render(<HeatmapHub />);
    fireEvent.click(screen.getByTestId("heatmap-tab-stock"));
    expect(
      screen.getByTestId("heatmap-tab-stock")
    ).toHaveAttribute("aria-selected", "true");
  });

  it("accepts a defaultHeatmap prop", () => {
    render(<HeatmapHub defaultHeatmap="stock" />);
    expect(
      screen.getByTestId("heatmap-tab-stock")
    ).toHaveAttribute("aria-selected", "true");
  });

  it("renders the Heatmaps heading", () => {
    render(<HeatmapHub />);
    expect(screen.getByText("Heatmaps")).toBeInTheDocument();
  });
});
