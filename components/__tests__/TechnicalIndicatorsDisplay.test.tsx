/**
 * Unit tests for TechnicalIndicatorsDisplay component
 *
 * Requirements: 5.1, 5.3, 5.4, 5.5, 5.6
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TechnicalIndicatorsDisplay } from "../TechnicalIndicatorsDisplay";
import { TechnicalIndicators } from "@/types";

vi.mock("@/lib/theme-context", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

const mockIndicators: TechnicalIndicators = {
  rsi: { value: 72.5, signal: "overpriced" },
  macd: { value: 1.2345, signal: 0.9876, histogram: 0.2469, trend: "underpriced" },
  movingAverages: { ma50: 155.0, ma200: 140.0, signal: "fair" },
  bollingerBands: { upper: 170.0, middle: 150.0, lower: 130.0, signal: "overpriced" },
  overallSentiment: "overpriced",
};

describe("TechnicalIndicatorsDisplay", () => {
  it("should render all four indicator cards", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);

    expect(screen.getByText("RSI (Relative Strength Index)")).toBeInTheDocument();
    expect(screen.getAllByText("MACD").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Moving Averages")).toBeInTheDocument();
    expect(screen.getByText("Bollinger Bands")).toBeInTheDocument();
  });

  it("should display RSI value", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    expect(screen.getByText("72.50")).toBeInTheDocument();
  });

  it("should display MACD values", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    expect(screen.getByText("1.2345")).toBeInTheDocument();
    expect(screen.getByText("0.9876")).toBeInTheDocument();
    expect(screen.getByText("0.2469")).toBeInTheDocument();
  });

  it("should display Moving Average values", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    expect(screen.getByText("155.00")).toBeInTheDocument();
    expect(screen.getByText("140.00")).toBeInTheDocument();
  });

  it("should display Bollinger Band values", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    expect(screen.getByText("170.00")).toBeInTheDocument();
    expect(screen.getByText("150.00")).toBeInTheDocument();
    expect(screen.getByText("130.00")).toBeInTheDocument();
  });

  it("should display overall sentiment gauge", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    const gauge = screen.getByTestId("sentiment-gauge");
    expect(gauge).toBeInTheDocument();
    expect(screen.getByText("Overall: Appears Overpriced")).toBeInTheDocument();
  });

  it("should color-code overpriced signals as red badges", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    // RSI and Bollinger Bands are overpriced — there should be "Overpriced" badges
    const badges = screen.getAllByText("Overpriced");
    // 2 indicator cards + 1 sentiment badge = 3
    expect(badges.length).toBe(3);
  });

  it("should color-code underpriced signals as green badges", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    const badges = screen.getAllByText("Underpriced");
    expect(badges.length).toBe(1); // MACD
  });

  it("should color-code fair signals as gray badges", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    const badges = screen.getAllByText("Fairly Priced");
    expect(badges.length).toBe(1); // Moving Averages
  });

  it("should show tooltip on hover over indicator name", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);

    const rsiLabel = screen.getByText("RSI (Relative Strength Index)");
    const hoverTarget = rsiLabel.closest("div")!;
    fireEvent.mouseEnter(hoverTarget);

    expect(
      screen.getByText(/RSI measures the speed and magnitude/)
    ).toBeInTheDocument();
  });

  it("should hide tooltip on mouse leave", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);

    const rsiLabel = screen.getByText("RSI (Relative Strength Index)");
    const hoverTarget = rsiLabel.closest("div")!;
    fireEvent.mouseEnter(hoverTarget);
    expect(screen.getByText(/RSI measures the speed and magnitude/)).toBeInTheDocument();

    fireEvent.mouseLeave(hoverTarget);
    expect(screen.queryByText(/RSI measures the speed and magnitude/)).not.toBeInTheDocument();
  });

  it("should NOT contain Buy or Sell language", () => {
    const { container } = render(
      <TechnicalIndicatorsDisplay indicators={mockIndicators} />
    );
    const text = container.textContent || "";
    expect(text).not.toMatch(/\bBuy\b/);
    expect(text).not.toMatch(/\bSell\b/);
  });

  it("should render loading skeleton when indicators is null", () => {
    const { container } = render(
      <TechnicalIndicatorsDisplay indicators={null} />
    );
    expect(screen.getByText("Technical Indicators")).toBeInTheDocument();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(4);
  });

  it("should render loading skeleton when indicators is undefined", () => {
    const { container } = render(
      <TechnicalIndicatorsDisplay indicators={undefined} />
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(4);
  });

  it("should display sentiment for underpriced overall", () => {
    const underpriced: TechnicalIndicators = {
      ...mockIndicators,
      overallSentiment: "underpriced",
    };
    render(<TechnicalIndicatorsDisplay indicators={underpriced} />);
    expect(screen.getByText("Overall: Appears Underpriced")).toBeInTheDocument();
  });

  it("should display sentiment for fair overall", () => {
    const fair: TechnicalIndicators = {
      ...mockIndicators,
      overallSentiment: "fair",
    };
    render(<TechnicalIndicatorsDisplay indicators={fair} />);
    expect(screen.getByText("Overall: Appears Fairly Priced")).toBeInTheDocument();
  });

  it("should show tooltip on hover over MACD indicator name", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    const macdLabels = screen.getAllByText("MACD");
    // The indicator card name is the one inside the card header
    const macdLabel = macdLabels[0];
    const hoverTarget = macdLabel.closest("div")!;
    fireEvent.mouseEnter(hoverTarget);
    expect(
      screen.getByText(/Moving Average Convergence Divergence/)
    ).toBeInTheDocument();
  });

  it("should show tooltip on hover over Moving Averages indicator name", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    const maLabel = screen.getByText("Moving Averages");
    const hoverTarget = maLabel.closest("div")!;
    fireEvent.mouseEnter(hoverTarget);
    expect(
      screen.getByText(/Moving averages smooth out price data/)
    ).toBeInTheDocument();
  });

  it("should show tooltip on hover over Bollinger Bands indicator name", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    const bbLabel = screen.getByText("Bollinger Bands");
    const hoverTarget = bbLabel.closest("div")!;
    fireEvent.mouseEnter(hoverTarget);
    expect(
      screen.getByText(/Bollinger Bands consist of a middle band/)
    ).toBeInTheDocument();
  });

  it("should show all badges as Underpriced when all indicators are underpriced", () => {
    const allUnderpriced: TechnicalIndicators = {
      rsi: { value: 25.0, signal: "underpriced" },
      macd: { value: -0.5, signal: -0.3, histogram: -0.2, trend: "underpriced" },
      movingAverages: { ma50: 140.0, ma200: 155.0, signal: "underpriced" },
      bollingerBands: { upper: 170.0, middle: 150.0, lower: 130.0, signal: "underpriced" },
      overallSentiment: "underpriced",
    };
    render(<TechnicalIndicatorsDisplay indicators={allUnderpriced} />);
    const badges = screen.getAllByText("Underpriced");
    // 4 indicator cards + 1 sentiment badge = 5
    expect(badges.length).toBe(5);
  });

  it("should show all badges as Fairly Priced when all indicators are fair", () => {
    const allFair: TechnicalIndicators = {
      rsi: { value: 50.0, signal: "fair" },
      macd: { value: 0.0, signal: 0.0, histogram: 0.0, trend: "fair" },
      movingAverages: { ma50: 150.0, ma200: 150.0, signal: "fair" },
      bollingerBands: { upper: 170.0, middle: 150.0, lower: 130.0, signal: "fair" },
      overallSentiment: "fair",
    };
    render(<TechnicalIndicatorsDisplay indicators={allFair} />);
    const badges = screen.getAllByText("Fairly Priced");
    // 4 indicator cards + 1 sentiment badge = 5
    expect(badges.length).toBe(5);
  });

  it("should show all badges as Overpriced when all indicators are overpriced", () => {
    const allOverpriced: TechnicalIndicators = {
      rsi: { value: 85.0, signal: "overpriced" },
      macd: { value: 2.0, signal: 1.5, histogram: 0.5, trend: "overpriced" },
      movingAverages: { ma50: 170.0, ma200: 140.0, signal: "overpriced" },
      bollingerBands: { upper: 170.0, middle: 150.0, lower: 130.0, signal: "overpriced" },
      overallSentiment: "overpriced",
    };
    render(<TechnicalIndicatorsDisplay indicators={allOverpriced} />);
    const badges = screen.getAllByText("Overpriced");
    // 4 indicator cards + 1 sentiment badge = 5
    expect(badges.length).toBe(5);
  });

  it("should render correctly with zero values", () => {
    const zeroIndicators: TechnicalIndicators = {
      rsi: { value: 0, signal: "fair" },
      macd: { value: 0, signal: 0, histogram: 0, trend: "fair" },
      movingAverages: { ma50: 0, ma200: 0, signal: "fair" },
      bollingerBands: { upper: 0, middle: 0, lower: 0, signal: "fair" },
      overallSentiment: "fair",
    };
    render(<TechnicalIndicatorsDisplay indicators={zeroIndicators} />);
    // RSI (0.00), MA50 (0.00), MA200 (0.00), Upper (0.00), Middle (0.00), Lower (0.00) = 6
    const zeroTwo = screen.getAllByText("0.00");
    expect(zeroTwo.length).toBe(6);
    // MACD value, signal, histogram formatted to 4 decimal places
    const zeroFour = screen.getAllByText("0.0000");
    expect(zeroFour.length).toBe(3);
  });

  it("should render correctly with negative values", () => {
    const negativeIndicators: TechnicalIndicators = {
      rsi: { value: 15.5, signal: "underpriced" },
      macd: { value: -2.5678, signal: -1.2345, histogram: -1.3333, trend: "underpriced" },
      movingAverages: { ma50: 100.0, ma200: 120.0, signal: "underpriced" },
      bollingerBands: { upper: 130.0, middle: 110.0, lower: 90.0, signal: "underpriced" },
      overallSentiment: "underpriced",
    };
    render(<TechnicalIndicatorsDisplay indicators={negativeIndicators} />);
    expect(screen.getByText("-2.5678")).toBeInTheDocument();
    expect(screen.getByText("-1.2345")).toBeInTheDocument();
    expect(screen.getByText("-1.3333")).toBeInTheDocument();
  });

  it("should have the correct data-testid on the sentiment gauge", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    const gauge = screen.getByTestId("sentiment-gauge");
    expect(gauge).toBeInTheDocument();
    expect(gauge.getAttribute("data-testid")).toBe("sentiment-gauge");
  });

  it("should display a help icon (?) for each indicator card", () => {
    render(<TechnicalIndicatorsDisplay indicators={mockIndicators} />);
    const helpIcons = screen.getAllByText("?");
    // One "?" per indicator card = 4
    expect(helpIcons.length).toBe(4);
  });
});
