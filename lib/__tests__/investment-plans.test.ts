import { describe, expect, it } from "vitest";
import { subscriptionService } from "@/services/subscription.service";
import {
  assembleInvestmentPlans,
  displayAssetClass,
  fitPlanHoldings,
  INVESTMENT_PLAN_ORDER,
  INVESTMENT_PLAN_SPECS,
  parseInvestmentPlanCandidates,
  presentInvestmentPlans,
  selectAggressiveGrowthHoldings,
  trailingReturnPercent,
} from "@/lib/investment-plans";

const payload = {
  plans: [
    {
      id: "defensive",
      thesis: "Ballast first.",
      holdings: [
        {
          symbol: "BND",
          name: "Total Bond",
          assetClass: "bond",
          weight: 40,
          rationale: "Core bonds.",
        },
        {
          symbol: "AGG",
          name: "US Aggregate",
          assetClass: "bond",
          weight: 25,
          rationale: "Broad bonds.",
        },
        {
          symbol: "IEF",
          name: "Treasury",
          assetClass: "bond",
          weight: 10,
          rationale: "Duration.",
        },
        {
          symbol: "VTI",
          name: "Total Stock",
          assetClass: "stock",
          weight: 12,
          rationale: "Equity sleeve.",
        },
        {
          symbol: "VXUS",
          name: "Intl Stock",
          assetClass: "stock",
          weight: 8,
          rationale: "Overseas sleeve.",
        },
        {
          symbol: "SGOV",
          name: "T-bills",
          assetClass: "cash",
          weight: 5,
          rationale: "Dry powder.",
        },
      ],
    },
    {
      id: "balance",
      thesis: "Split the difference.",
      holdings: [
        {
          symbol: "VTI",
          name: "Total Stock",
          assetClass: "stock",
          weight: 35,
          rationale: "US stocks.",
        },
        {
          symbol: "VXUS",
          name: "Intl",
          assetClass: "stock",
          weight: 20,
          rationale: "International.",
        },
        {
          symbol: "BND",
          name: "Bonds",
          assetClass: "bond",
          weight: 25,
          rationale: "Core bonds.",
        },
        {
          symbol: "IEF",
          name: "Treasury",
          assetClass: "bond",
          weight: 15,
          rationale: "Treasuries.",
        },
        {
          symbol: "BIL",
          name: "Bills",
          assetClass: "cash",
          weight: 5,
          rationale: "Cash.",
        },
      ],
    },
    {
      id: "growth",
      thesis: "Equities only.",
      holdings: [
        {
          symbol: "VTI",
          name: "Total Stock",
          assetClass: "stock",
          weight: 30,
          rationale: "US core.",
        },
        {
          symbol: "QQQ",
          name: "Nasdaq",
          assetClass: "stock",
          weight: 20,
          rationale: "Growth.",
        },
        {
          symbol: "VXUS",
          name: "Intl",
          assetClass: "stock",
          weight: 20,
          rationale: "International.",
        },
        {
          symbol: "VUG",
          name: "Growth ETF",
          assetClass: "stock",
          weight: 15,
          rationale: "Style.",
        },
        {
          symbol: "VGT",
          name: "Info Tech",
          assetClass: "stock",
          weight: 15,
          rationale: "Sector sleeve.",
        },
      ],
    },
    {
      id: "dividend",
      thesis: "Income from owners' earnings.",
      holdings: [
        {
          symbol: "SCHD",
          name: "Dividend ETF",
          assetClass: "stock",
          weight: 30,
          rationale: "Dividend ETF.",
        },
        {
          symbol: "VYM",
          name: "High Dividend",
          assetClass: "stock",
          weight: 20,
          rationale: "Yield.",
        },
        {
          symbol: "VIG",
          name: "Dividend Growth",
          assetClass: "stock",
          weight: 20,
          rationale: "Growth of payouts.",
        },
        {
          symbol: "NOBL",
          name: "Dividend Aristocrats",
          assetClass: "stock",
          weight: 15,
          rationale: "Payout history.",
        },
        {
          symbol: "DGRO",
          name: "Dividend Growth",
          assetClass: "stock",
          weight: 15,
          rationale: "Cash returns.",
        },
      ],
    },
    {
      id: "aggressive-growth",
      thesis: "Only the multi-year leaders.",
      riskScore: 1,
      holdings: [
        {
          symbol: "NVDA",
          name: "NVIDIA",
          assetClass: "stock",
          weight: 25,
          rationale: "Multi-year leader.",
        },
        {
          symbol: "AVGO",
          name: "Broadcom",
          assetClass: "stock",
          weight: 20,
          rationale: "Compounder.",
        },
        {
          symbol: "LLY",
          name: "Lilly",
          assetClass: "stock",
          weight: 20,
          rationale: "Earnings run.",
        },
        {
          symbol: "NFLX",
          name: "Netflix",
          assetClass: "stock",
          weight: 20,
          rationale: "Margin expansion.",
        },
        {
          symbol: "QQQ",
          name: "Nasdaq",
          assetClass: "stock",
          weight: 15,
          rationale: "Should be dropped.",
        },
      ],
    },
  ],
};

describe("investment plan ideas", () => {
  it("builds five plans with fixed risk scores and weights that sum to 100", () => {
    const plans = assembleInvestmentPlans(
      parseInvestmentPlanCandidates(JSON.stringify(payload))
    );

    expect(plans.map((plan) => plan.id)).toEqual([...INVESTMENT_PLAN_ORDER]);
    expect(plans.map((plan) => plan.riskScore)).toEqual([2, 3, 5, 7, 9]);
    expect(plans.map((plan) => plan.riskLabel)).toEqual([
      "Very low",
      "Low",
      "Medium",
      "High",
      "Very high",
    ]);
    expect(plans[2]?.id).toBe("dividend");

    for (const plan of plans) {
      const total = plan.holdings.reduce(
        (sum, holding) => sum + holding.weight,
        0
      );
      expect(total).toBeCloseTo(100, 5);
      expect(plan.riskScore).toBe(INVESTMENT_PLAN_SPECS[plan.id].riskScore);
    }

    const defensive = plans.find((plan) => plan.id === "defensive");
    const bondWeight = defensive?.holdings
      .filter((holding) => holding.assetClass === "bond")
      .reduce((sum, holding) => sum + holding.weight, 0);
    expect(bondWeight).toBeGreaterThanOrEqual(70);
    expect(defensive?.holdings.map((holding) => holding.symbol)).not.toContain(
      "SGOV"
    );
    expect(
      plans
        .find((plan) => plan.id === "balanced")
        ?.holdings.map((holding) => holding.symbol)
    ).not.toContain("BIL");

    const growth = plans.find((plan) => plan.id === "growth");
    expect(
      growth?.holdings.every((holding) => holding.assetClass === "etf")
    ).toBe(true);

    const dividend = plans.find((plan) => plan.id === "dividend");
    expect(
      dividend?.holdings.every((holding) => holding.assetClass === "etf")
    ).toBe(true);

    const aggressive = plans.find((plan) => plan.id === "aggressive-growth");
    expect(aggressive?.holdings.map((holding) => holding.symbol)).not.toContain(
      "QQQ"
    );
    expect(
      aggressive?.holdings.every((holding) => holding.assetClass === "stock")
    ).toBe(true);
  });

  it("rejects a set that is missing a plan", () => {
    expect(() =>
      parseInvestmentPlanCandidates(
        JSON.stringify({ plans: payload.plans.slice(0, 3) })
      )
    ).toThrow(/incomplete investment plan set/i);
  });

  it("drops funds from aggressive growth and keeps single stocks", () => {
    const fitted = fitPlanHoldings("aggressive-growth", [
      {
        symbol: "NVDA",
        name: "NVIDIA",
        assetClass: "stock",
        weight: 30,
        rationale: "Leader.",
      },
      {
        symbol: "AVGO",
        name: "Broadcom",
        assetClass: "stock",
        weight: 25,
        rationale: "Leader.",
      },
      {
        symbol: "LLY",
        name: "Lilly",
        assetClass: "stock",
        weight: 25,
        rationale: "Leader.",
      },
      {
        symbol: "META",
        name: "Meta",
        assetClass: "stock",
        weight: 20,
        rationale: "Leader.",
      },
      {
        symbol: "SPY",
        name: "S&P",
        assetClass: "stock",
        weight: 20,
        rationale: "Fund.",
      },
    ]);
    expect(fitted.map((holding) => holding.symbol)).toEqual([
      "NVDA",
      "AVGO",
      "LLY",
      "META",
    ]);
  });

  it("measures a multi-year return and ignores a short window", () => {
    const start = new Date("2021-01-01T00:00:00.000Z");
    const end = new Date("2025-01-01T00:00:00.000Z");
    expect(
      trailingReturnPercent([
        { timestamp: start, close: 100 },
        { timestamp: end, close: 250 },
      ])
    ).toBeCloseTo(150, 5);
    expect(
      trailingReturnPercent([
        { timestamp: new Date("2025-01-01"), close: 100 },
        { timestamp: new Date("2025-06-01"), close: 180 },
      ])
    ).toBeNull();
  });

  it("keeps aggressive-growth names that cleared the multi-year bar", () => {
    const chosen = selectAggressiveGrowthHoldings([
      { symbol: "SLOW", weight: 20, trailingReturnPercent: 10 },
      { symbol: "NVDA", weight: 20, trailingReturnPercent: 400 },
      { symbol: "AVGO", weight: 20, trailingReturnPercent: 180 },
      { symbol: "LLY", weight: 20, trailingReturnPercent: 120 },
      { symbol: "META", weight: 20, trailingReturnPercent: 90 },
      { symbol: "UNKNOWN", weight: 20, trailingReturnPercent: null },
    ]);
    expect(chosen.map((holding) => holding.symbol)).toEqual([
      "NVDA",
      "AVGO",
      "LLY",
      "META",
    ]);
  });

  it("labels stored equity ETFs as ETFs and keeps single stocks as stocks", () => {
    expect(displayAssetClass({ symbol: "SCHD", assetClass: "stock" })).toBe(
      "etf"
    );
    expect(displayAssetClass({ symbol: "BND", assetClass: "stock" })).toBe(
      "bond"
    );
    expect(displayAssetClass({ symbol: "NVDA", assetClass: "stock" })).toBe(
      "stock"
    );
  });

  it("shows dividend in the middle with the current risk labels", () => {
    const presented = presentInvestmentPlans([
      {
        id: "aggressive-growth",
        name: "Old",
        summary: "Old",
        thesis: "Leaders.",
        riskScore: 9,
        riskLabel: "Very high",
        holdings: [],
      },
      {
        id: "dividend",
        name: "Old",
        summary: "Old",
        thesis: "Income.",
        riskScore: 6,
        riskLabel: "High",
        holdings: [],
      },
      {
        id: "growth",
        name: "Old",
        summary: "Old",
        thesis: "Equities.",
        riskScore: 7,
        riskLabel: "High",
        holdings: [],
      },
      {
        id: "balanced",
        name: "Old",
        summary: "Old",
        thesis: "Mix.",
        riskScore: 4,
        riskLabel: "Medium",
        holdings: [],
      },
      {
        id: "defensive",
        name: "Old",
        summary: "Old",
        thesis: "Bonds.",
        riskScore: 2,
        riskLabel: "Low",
        holdings: [],
      },
    ]);

    expect(presented.map((plan) => plan.id)).toEqual([
      "defensive",
      "balanced",
      "dividend",
      "growth",
      "aggressive-growth",
    ]);
    expect(presented.map((plan) => plan.riskLabel)).toEqual([
      "Very low",
      "Low",
      "Medium",
      "High",
      "Very high",
    ]);
    expect(presented[2]?.riskScore).toBe(5);
  });

  it("lists investment plan ideas only on paid AI tiers", () => {
    for (const tier of subscriptionService.getPricingTiers()) {
      const listed = tier.features.some((feature) =>
        feature.toLowerCase().includes("investment plan")
      );
      if (
        tier.tier === "LOCAL" ||
        tier.tier === "BYOK" ||
        tier.tier === "HOSTED_AI"
      ) {
        expect(listed).toBe(true);
      } else {
        expect(listed).toBe(false);
      }
    }
  });
});
