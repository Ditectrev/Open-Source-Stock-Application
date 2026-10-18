import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InvestmentPlansPanel } from "../InvestmentPlansPanel";
import type { InvestmentPlansResult } from "@/types";

const result: InvestmentPlansResult = {
  generatedAt: new Date("2026-05-18T12:00:00.000Z"),
  plans: [
    {
      id: "defensive",
      name: "Defensive",
      summary: "Mostly bonds.",
      thesis: "Mostly bonds.",
      riskScore: 2,
      riskLabel: "Low",
      holdings: [
        {
          symbol: "BND",
          name: "Vanguard Total Bond",
          assetClass: "bond",
          weight: 45,
          rationale: "Core bond ballast.",
          price: 72.5,
          changePercent: 0.1,
        },
        {
          symbol: "VTI",
          name: "Vanguard Total Stock",
          assetClass: "stock",
          weight: 20,
          rationale: "Small equity sleeve.",
        },
        {
          symbol: "IEF",
          name: "Treasury ETF",
          assetClass: "bond",
          weight: 5,
          rationale: "Intermediate Treasuries.",
        },
        {
          symbol: "AGG",
          name: "US Aggregate",
          assetClass: "bond",
          weight: 30,
          rationale: "Broad bonds.",
        },
      ],
    },
    {
      id: "balanced",
      name: "Balanced",
      summary: "Bonds and stocks.",
      thesis: "A middle path.",
      riskScore: 4,
      riskLabel: "Medium",
      holdings: [
        {
          symbol: "VTI",
          name: "Total Stock",
          assetClass: "stock",
          weight: 35,
          rationale: "Stocks.",
        },
        {
          symbol: "BND",
          name: "Total Bond",
          assetClass: "bond",
          weight: 40,
          rationale: "Bonds.",
        },
        {
          symbol: "IEF",
          name: "Treasury ETF",
          assetClass: "bond",
          weight: 5,
          rationale: "Intermediate Treasuries.",
        },
        {
          symbol: "VXUS",
          name: "International",
          assetClass: "stock",
          weight: 20,
          rationale: "Abroad.",
        },
      ],
    },
    {
      id: "growth",
      name: "Growth",
      summary: "Equities only.",
      thesis: "Stay in stocks.",
      riskScore: 7,
      riskLabel: "High",
      holdings: [
        {
          symbol: "QQQ",
          name: "Nasdaq",
          assetClass: "stock",
          weight: 40,
          rationale: "Growth.",
        },
        {
          symbol: "VTI",
          name: "Total Stock",
          assetClass: "stock",
          weight: 30,
          rationale: "Core.",
        },
        {
          symbol: "VXUS",
          name: "International",
          assetClass: "stock",
          weight: 20,
          rationale: "Abroad.",
        },
        {
          symbol: "AAPL",
          name: "Apple",
          assetClass: "stock",
          weight: 10,
          rationale: "Compounder.",
        },
      ],
    },
    {
      id: "dividend",
      name: "Dividend",
      summary: "Income stocks and ETFs.",
      thesis: "Get paid to wait.",
      riskScore: 6,
      riskLabel: "High",
      holdings: [
        {
          symbol: "SCHD",
          name: "Dividend ETF",
          assetClass: "stock",
          weight: 40,
          rationale: "Income ETF.",
        },
        {
          symbol: "VYM",
          name: "High dividend",
          assetClass: "stock",
          weight: 25,
          rationale: "Yield.",
        },
        {
          symbol: "JNJ",
          name: "Johnson & Johnson",
          assetClass: "stock",
          weight: 20,
          rationale: "Payout.",
        },
        {
          symbol: "KO",
          name: "Coca-Cola",
          assetClass: "stock",
          weight: 15,
          rationale: "Cash returns.",
        },
      ],
    },
    {
      id: "aggressive-growth",
      name: "Aggressive Growth",
      summary: "Multi-year leaders.",
      thesis: "Concentrated winners.",
      riskScore: 9,
      riskLabel: "Very high",
      holdings: [
        {
          symbol: "NVDA",
          name: "NVIDIA",
          assetClass: "stock",
          weight: 40,
          rationale: "Multi-year leader.",
          trailingReturnPercent: 420,
        },
        {
          symbol: "AVGO",
          name: "Broadcom",
          assetClass: "stock",
          weight: 25,
          rationale: "Compounder.",
          trailingReturnPercent: 180,
        },
        {
          symbol: "LLY",
          name: "Lilly",
          assetClass: "stock",
          weight: 20,
          rationale: "Earnings.",
          trailingReturnPercent: 140,
        },
        {
          symbol: "META",
          name: "Meta",
          assetClass: "stock",
          weight: 15,
          rationale: "Margins.",
          trailingReturnPercent: 110,
        },
      ],
    },
  ],
};

describe("InvestmentPlansPanel", () => {
  it("gates Free and Ads-free users without showing allocations", () => {
    const { rerender } = render(
      <InvestmentPlansPanel
        result={null}
        loading={false}
        locked
        pricingTier="FREE"
      />
    );

    expect(
      screen.getByText(
        /AI is available on Local AI, BYOK, and Ditectrev AI plans/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("investment-allocation-chart")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("NVDA")).not.toBeInTheDocument();

    rerender(
      <InvestmentPlansPanel
        result={null}
        loading={false}
        locked
        pricingTier="ADS_FREE"
      />
    );
    expect(
      screen.queryByTestId("investment-allocation-chart")
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /View AI plans/i })
    ).toHaveAttribute("href", "/pricing");
  });

  it("switches plans and highlights the clicked allocation slice", async () => {
    const user = userEvent.setup();
    render(
      <InvestmentPlansPanel
        result={result}
        loading={false}
        locked={false}
        pricingTier="HOSTED_AI"
      />
    );

    expect(screen.getByRole("radio", { name: /Defensive/i })).toBeChecked();
    expect(screen.getByText("2/10 · Low")).toBeInTheDocument();
    expect(screen.getByText("9/10 · Very high")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /Dividend/i }));
    expect(screen.getByRole("radio", { name: /Dividend/i })).toBeChecked();
    expect(screen.getByText("Get paid to wait.")).toBeInTheDocument();

    const schdSlice = screen.getByRole("button", { name: "SCHD 40 percent" });
    expect(schdSlice).toHaveAttribute("data-active", "true");

    await user.click(screen.getByRole("button", { name: "KO 15 percent" }));
    expect(
      screen.getByRole("button", { name: "KO 15 percent" })
    ).toHaveAttribute("data-active", "true");
    expect(screen.getByText("Cash returns.")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /Aggressive Growth/i }));
    expect(
      screen.getAllByText(/over the measured window/i).length
    ).toBeGreaterThan(0);
    expect(
      screen
        .getAllByRole("link", { name: "Quote" })
        .some((link) => link.getAttribute("href")?.includes("symbol=NVDA"))
    ).toBe(true);
  });
});
