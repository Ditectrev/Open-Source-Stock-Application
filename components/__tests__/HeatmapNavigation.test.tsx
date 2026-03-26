import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  HeatmapNavigation,
  HeatmapType,
} from "@/components/HeatmapNavigation";

vi.mock("@/lib/theme-context", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

describe("HeatmapNavigation", () => {
  const defaultProps = {
    activeHeatmap: "etf" as HeatmapType,
    onHeatmapChange: vi.fn(),
  };

  it("renders all three heatmap tabs", () => {
    render(<HeatmapNavigation {...defaultProps} />);
    expect(screen.getByTestId("heatmap-tab-etf")).toBeInTheDocument();
    expect(screen.getByTestId("heatmap-tab-crypto")).toBeInTheDocument();
    expect(screen.getByTestId("heatmap-tab-stock")).toBeInTheDocument();
  });

  it("marks the active tab with aria-selected", () => {
    render(<HeatmapNavigation {...defaultProps} />);
    expect(
      screen.getByTestId("heatmap-tab-etf")
    ).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByTestId("heatmap-tab-crypto")
    ).toHaveAttribute("aria-selected", "false");
    expect(
      screen.getByTestId("heatmap-tab-stock")
    ).toHaveAttribute("aria-selected", "false");
  });

  it("calls onHeatmapChange when a tab is clicked", () => {
    const onChange = vi.fn();
    render(
      <HeatmapNavigation activeHeatmap="etf" onHeatmapChange={onChange} />
    );
    fireEvent.click(screen.getByTestId("heatmap-tab-crypto"));
    expect(onChange).toHaveBeenCalledWith("crypto");
  });

  it("renders with tablist role for accessibility", () => {
    render(<HeatmapNavigation {...defaultProps} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("switches active styling when activeHeatmap changes", () => {
    const { rerender } = render(<HeatmapNavigation {...defaultProps} />);
    expect(
      screen.getByTestId("heatmap-tab-etf")
    ).toHaveAttribute("aria-selected", "true");

    rerender(
      <HeatmapNavigation
        activeHeatmap="stock"
        onHeatmapChange={defaultProps.onHeatmapChange}
      />
    );
    expect(
      screen.getByTestId("heatmap-tab-etf")
    ).toHaveAttribute("aria-selected", "false");
    expect(
      screen.getByTestId("heatmap-tab-stock")
    ).toHaveAttribute("aria-selected", "true");
  });
});
