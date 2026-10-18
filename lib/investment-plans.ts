import { extractFirstJsonObject } from "@/lib/stock-of-the-day-ai";
import type {
  InvestmentAssetClass,
  InvestmentPlan,
  InvestmentPlanHolding,
  InvestmentPlanId,
} from "@/types";

export const INVESTMENT_PLAN_ORDER: readonly InvestmentPlanId[] = [
  "defensive",
  "balanced",
  "dividend",
  "growth",
  "aggressive-growth",
];

export const INVESTMENT_PLANS_MAX_OUTPUT_TOKENS = 8192;

/** Multi-year price change required before a name can sit in Aggressive Growth. */
export const AGGRESSIVE_GROWTH_MIN_TRAILING_RETURN = 80;
/** Used only when fewer than four names clear the primary bar. */
export const AGGRESSIVE_GROWTH_FALLBACK_TRAILING_RETURN = 40;
export const AGGRESSIVE_GROWTH_MIN_HOLDINGS = 4;

const MIN_HOLDINGS = 4;
const MAX_HOLDINGS = 7;

const BOND_ETFS = new Set([
  "AGG",
  "BND",
  "BNDX",
  "BIV",
  "BLV",
  "BSV",
  "EMB",
  "GOVT",
  "HYG",
  "IEF",
  "IGIB",
  "IGSB",
  "IUSB",
  "JNK",
  "LQD",
  "MBB",
  "MUB",
  "SCHR",
  "SCHZ",
  "SCHO",
  "SHY",
  "SPIB",
  "SJNK",
  "TIP",
  "TLT",
  "USIG",
  "VCIT",
  "VCSH",
  "VGIT",
  "VGLT",
  "VTEB",
]);

const CASH_ETFS = new Set(["BIL", "GBIL", "SGOV", "SHV"]);

const EQUITY_ETFS = new Set([
  "DIA",
  "DGRO",
  "DVY",
  "HDV",
  "ITOT",
  "IWM",
  "IXUS",
  "NOBL",
  "QQQ",
  "QUAL",
  "SCHD",
  "SCHG",
  "SPY",
  "SPYG",
  "VEA",
  "VOO",
  "VOOG",
  "VTI",
  "VT",
  "VUG",
  "VWO",
  "VXUS",
  "VIG",
  "VIGI",
  "VYM",
  "VGT",
  "XLK",
  "DGRW",
  "JEPI",
  "JEPQ",
  "SCHY",
  "SPHD",
]);

type PlanSpec = {
  name: string;
  summary: string;
  riskScore: number;
  riskLabel: string;
  targets: Partial<Record<InvestmentAssetClass, number>>;
  allowed: InvestmentAssetClass[];
};

export const INVESTMENT_PLAN_SPECS: Record<InvestmentPlanId, PlanSpec> = {
  defensive: {
    name: "Defensive",
    summary:
      "Mostly investment-grade bond ETFs, with a small equity ETF sleeve. Shaped like a Revolut-style defensive portfolio.",
    riskScore: 2,
    riskLabel: "Very low",
    targets: { bond: 80, etf: 20 },
    allowed: ["bond", "etf"],
  },
  balanced: {
    name: "Balanced",
    summary:
      "Bond ETFs and equity ETFs together, closer to a Revolut balanced portfolio.",
    riskScore: 3,
    riskLabel: "Low",
    targets: { bond: 40, etf: 60 },
    allowed: ["bond", "etf"],
  },
  dividend: {
    name: "Dividend",
    summary:
      "Dividend ETFs built for income, in the spirit of an XTB dividend plan.",
    riskScore: 5,
    riskLabel: "Medium",
    targets: { etf: 100 },
    allowed: ["etf"],
  },
  growth: {
    name: "Growth",
    summary:
      "Equity ETFs only. Broad market exposure, with no single-stock bets.",
    riskScore: 7,
    riskLabel: "High",
    targets: { etf: 100 },
    allowed: ["etf"],
  },
  "aggressive-growth": {
    name: "Aggressive Growth",
    summary:
      "A concentrated list of individual stocks with standout multi-year price performance.",
    riskScore: 9,
    riskLabel: "Very high",
    targets: { stock: 100 },
    allowed: ["stock"],
  },
};

/**
 * Slice tones for the allocation chart. Light mode uses darker fills so
 * the bars stay visible on white; dark mode uses the lighter pair.
 */
export const ALLOCATION_SLICE_TONES = [
  "text-emerald-800 dark:text-emerald-300",
  "text-stone-700 dark:text-stone-200",
  "text-teal-800 dark:text-teal-300",
  "text-amber-800 dark:text-amber-300",
  "text-sky-800 dark:text-sky-300",
  "text-emerald-950 dark:text-emerald-200",
  "text-orange-900 dark:text-orange-300",
  "text-stone-600 dark:text-stone-300",
] as const;

export const ASSET_CLASS_TONES: Record<InvestmentAssetClass, string> = {
  bond: "text-stone-600 dark:text-stone-300",
  etf: "text-emerald-800 dark:text-emerald-300",
  stock: "text-amber-800 dark:text-amber-300",
};

export const ASSET_CLASS_LABELS: Record<InvestmentAssetClass, string> = {
  bond: "Bonds",
  etf: "ETFs",
  stock: "Stocks",
};

export function holdingInstrumentLabel(
  assetClass: InvestmentAssetClass
): string {
  if (assetClass === "bond") return "Bond ETF";
  if (assetClass === "etf") return "ETF";
  return "Stock";
}

export type InvestmentPlanDraftHolding = {
  symbol: string;
  name: string;
  assetClass: InvestmentAssetClass;
  weight: number;
  rationale: string;
};

export type InvestmentPlanDraft = {
  id: InvestmentPlanId;
  thesis: string;
  holdings: InvestmentPlanDraftHolding[];
};

type PricePoint = {
  timestamp: Date | string;
  close: number;
};

export const INVESTMENT_PLANS_PROMPT = `You are building five ready-made investment plan ideas for a paid research feature. The mixes should feel like Revolut portfolios plus an XTB dividend plan, with one custom aggressive-growth book. Return ONLY valid JSON, no markdown, in this exact shape:
{
  "plans": [
    {
      "id": "defensive" | "balanced" | "growth" | "dividend" | "aggressive-growth",
      "thesis": string,
      "holdings": [
        {"symbol": string, "name": string, "assetClass": "bond" | "etf" | "stock", "weight": number, "rationale": string}
      ]
    }
  ]
}

Include all five plans. Each plan has 5 to 7 holdings. Weights inside a plan are positive numbers that sum to 100. rationale and thesis are one short sentence each. Use US-listed tickers Yahoo Finance can quote, with no exchange suffix.

Plan rules:
- defensive: mostly bonds, like a Revolut defensive portfolio. About 80% investment-grade bond ETFs (AGG, BND, IEF, LQD, TIP, VGIT, or similar) and about 20% broad equity ETFs (VTI, VXUS, or similar). No single-stock bets. assetClass "bond" for bond ETFs and "etf" for equity ETFs.
- balanced: bond ETFs and equity ETFs together, like a Revolut balanced portfolio. About 60% equity ETFs and about 40% bond ETFs. No single stocks.
- dividend: an income plan like an XTB dividend investment plan. 100% dividend ETFs (SCHD, VYM, VIG, DGRO, NOBL, or similar). No bonds and no single stocks. assetClass "etf".
- growth: equity ETFs only. 100% broad equity ETFs across regions or styles, not one theme. No bonds and no single stocks. assetClass "etf".
- aggressive-growth: 100% individual common stocks that were among the strongest price performers over the last 3 to 5 years (roughly doubled or better). No ETFs and no bonds. assetClass "stock". Do not fill the list with famous mega-caps unless their multi-year run was genuinely exceptional.

Do not include cash, money-market funds, or Treasury-bill ETFs such as BIL, SGOV, SHV, or GBIL. Only the aggressive-growth plan holds individual stocks. The other four plans are ETFs.`;

export function incompleteInvestmentPlansMessage(): string {
  return "AI returned an incomplete investment plan set.";
}

export function isInvestmentPlanId(value: string): value is InvestmentPlanId {
  return (INVESTMENT_PLAN_ORDER as readonly string[]).includes(value);
}

export function investmentRiskTone(score: number): "low" | "medium" | "high" {
  if (score <= 3) return "low";
  if (score <= 5) return "medium";
  return "high";
}

export function allocationSliceTone(index: number): string {
  return ALLOCATION_SLICE_TONES[index % ALLOCATION_SLICE_TONES.length];
}

/** Known funds stay labeled as ETFs even when an older plan stored them as stocks. */
export function displayAssetClass(holding: {
  symbol: string;
  assetClass: InvestmentAssetClass;
}): InvestmentAssetClass {
  const symbol = holding.symbol.trim().toUpperCase();
  if (BOND_ETFS.has(symbol)) return "bond";
  if (EQUITY_ETFS.has(symbol)) return "etf";
  if (holding.assetClass === "bond" || holding.assetClass === "etf") {
    return holding.assetClass;
  }
  return "stock";
}

export function presentInvestmentPlans(
  plans: InvestmentPlan[]
): InvestmentPlan[] {
  return INVESTMENT_PLAN_ORDER.flatMap((id) => {
    const plan = plans.find((item) => item.id === id);
    if (!plan) return [];
    const spec = INVESTMENT_PLAN_SPECS[id];
    return [
      {
        ...plan,
        name: spec.name,
        summary: spec.summary,
        riskScore: spec.riskScore,
        riskLabel: spec.riskLabel,
      },
    ];
  });
}

export function isFundTicker(symbol: string): boolean {
  return (
    BOND_ETFS.has(symbol) || CASH_ETFS.has(symbol) || EQUITY_ETFS.has(symbol)
  );
}

export function resolveAssetClass(
  symbol: string,
  claimed: unknown
): InvestmentAssetClass | null {
  if (CASH_ETFS.has(symbol) || claimed === "cash") return null;
  if (BOND_ETFS.has(symbol)) return "bond";
  if (EQUITY_ETFS.has(symbol) || claimed === "etf") return "etf";
  if (claimed === "bond") return null;
  return "stock";
}

export function allocationByClass(
  holdings: Array<{
    symbol: string;
    assetClass: InvestmentAssetClass;
    weight: number;
  }>
): Array<{ assetClass: InvestmentAssetClass; weight: number }> {
  const totals: Record<InvestmentAssetClass, number> = {
    bond: 0,
    etf: 0,
    stock: 0,
  };
  for (const holding of holdings) {
    totals[displayAssetClass(holding)] += holding.weight;
  }
  return (["bond", "etf", "stock"] as const)
    .map((assetClass) => ({
      assetClass,
      weight: Math.round(totals[assetClass] * 10) / 10,
    }))
    .filter((item) => item.weight > 0);
}

export function roundWeightsTo100<T extends { weight: number }>(
  items: T[]
): T[] {
  if (items.length === 0) return [];
  const tenths = items.map((item) => Math.max(1, Math.round(item.weight * 10)));
  let sum = tenths.reduce((total, value) => total + value, 0);
  const order = tenths
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value);
  let guard = 0;
  while (sum !== 1000 && guard < 5000) {
    const index = order[guard % order.length].index;
    if (sum > 1000) {
      if (tenths[index] <= 1) {
        guard += 1;
        if (tenths.every((value) => value <= 1)) break;
        continue;
      }
      tenths[index] -= 1;
      sum -= 1;
    } else {
      tenths[index] += 1;
      sum += 1;
    }
    guard += 1;
  }
  return items.map((item, index) => ({
    ...item,
    weight: tenths[index] / 10,
  }));
}

export function scaleWeightsTo100<T extends { weight: number }>(
  items: T[]
): T[] {
  const relative = items.reduce(
    (sum, item) => sum + (item.weight > 0 ? item.weight : 1),
    0
  );
  return roundWeightsTo100(
    items.map((item) => ({
      ...item,
      weight: ((item.weight > 0 ? item.weight : 1) / relative) * 100,
    }))
  );
}

function requiredClasses(spec: PlanSpec): InvestmentAssetClass[] {
  return (
    Object.entries(spec.targets) as Array<
      [InvestmentAssetClass, number | undefined]
    >
  )
    .filter(([, weight]) => (weight ?? 0) > 0)
    .map(([assetClass]) => assetClass);
}

function capHoldings(
  holdings: InvestmentPlanDraftHolding[],
  spec: PlanSpec
): InvestmentPlanDraftHolding[] {
  const next = [...holdings];
  const required = new Set(requiredClasses(spec));
  while (next.length > MAX_HOLDINGS) {
    const counts = new Map<InvestmentAssetClass, number>();
    for (const holding of next) {
      counts.set(holding.assetClass, (counts.get(holding.assetClass) ?? 0) + 1);
    }
    const removable = next
      .map((holding, index) => ({ holding, index }))
      .filter(({ holding }) => {
        if (!required.has(holding.assetClass)) return true;
        return (counts.get(holding.assetClass) ?? 0) > 1;
      })
      .sort((a, b) => a.holding.weight - b.holding.weight);
    const drop = removable[0];
    if (!drop) break;
    next.splice(drop.index, 1);
  }
  return next;
}

export function fitPlanHoldings(
  id: InvestmentPlanId,
  holdings: InvestmentPlanDraftHolding[]
): InvestmentPlanDraftHolding[] {
  const spec = INVESTMENT_PLAN_SPECS[id];
  const cleaned: InvestmentPlanDraftHolding[] = [];
  const seen = new Set<string>();

  for (const holding of holdings) {
    const symbol = holding.symbol.trim().toUpperCase();
    if (!/^[A-Z]{1,5}$/.test(symbol) || seen.has(symbol)) continue;
    if (id === "aggressive-growth" && isFundTicker(symbol)) continue;
    const assetClass = resolveAssetClass(symbol, holding.assetClass);
    if (!assetClass || !spec.allowed.includes(assetClass)) continue;
    seen.add(symbol);
    cleaned.push({
      symbol,
      name: (holding.name.trim() || symbol).slice(0, 80),
      assetClass,
      weight: holding.weight > 0 ? holding.weight : 1,
      rationale: holding.rationale.trim().slice(0, 240),
    });
  }

  const capped = capHoldings(cleaned, spec);
  const byClass = new Map<InvestmentAssetClass, InvestmentPlanDraftHolding[]>();
  for (const holding of capped) {
    const bucket = byClass.get(holding.assetClass) ?? [];
    bucket.push(holding);
    byClass.set(holding.assetClass, bucket);
  }

  for (const assetClass of requiredClasses(spec)) {
    if (!byClass.get(assetClass)?.length) {
      throw new Error(incompleteInvestmentPlansMessage());
    }
  }

  const scaled: InvestmentPlanDraftHolding[] = [];
  for (const assetClass of requiredClasses(spec)) {
    const target = spec.targets[assetClass] ?? 0;
    const bucket = byClass.get(assetClass) ?? [];
    const relative = bucket.reduce((sum, item) => sum + item.weight, 0);
    for (const item of bucket) {
      scaled.push({
        ...item,
        weight: (item.weight / relative) * target,
      });
    }
  }

  const rounded = roundWeightsTo100(scaled);
  if (rounded.length < MIN_HOLDINGS) {
    throw new Error(incompleteInvestmentPlansMessage());
  }
  return rounded;
}

export function trailingReturnPercent(prices: PricePoint[]): number | null {
  if (prices.length < 2) return null;
  const sorted = [...prices].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const start = new Date(first.timestamp).getTime();
  const end = new Date(last.timestamp).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  const years = (end - start) / (365.25 * 24 * 60 * 60 * 1000);
  if (years < 2) return null;
  if (!(first.close > 0) || !(last.close > 0)) return null;
  return ((last.close - first.close) / first.close) * 100;
}

export function selectAggressiveGrowthHoldings<
  T extends { trailingReturnPercent?: number | null; weight: number },
>(holdings: T[]): T[] {
  const measured = holdings.filter(
    (holding): holding is T & { trailingReturnPercent: number } =>
      typeof holding.trailingReturnPercent === "number"
  );
  const strong = measured.filter(
    (holding) =>
      holding.trailingReturnPercent >= AGGRESSIVE_GROWTH_MIN_TRAILING_RETURN
  );
  const chosen =
    strong.length >= AGGRESSIVE_GROWTH_MIN_HOLDINGS
      ? strong
      : measured.filter(
          (holding) =>
            holding.trailingReturnPercent >=
            AGGRESSIVE_GROWTH_FALLBACK_TRAILING_RETURN
        );
  if (chosen.length < AGGRESSIVE_GROWTH_MIN_HOLDINGS) {
    throw new Error(
      "AI did not return enough top-performing stocks for the aggressive growth plan."
    );
  }
  return [...chosen].sort(
    (a, b) => b.trailingReturnPercent - a.trailingReturnPercent
  );
}

function normalizePlanId(raw: string): InvestmentPlanId | null {
  const id = raw
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
  if (id === "balance") return "balanced";
  if (id === "dividends") return "dividend";
  if (id === "aggressive" || id === "aggressivegrowth") {
    return "aggressive-growth";
  }
  return isInvestmentPlanId(id) ? id : null;
}

function parseDraftHoldings(value: unknown): InvestmentPlanDraftHolding[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const symbol =
      typeof record.symbol === "string"
        ? record.symbol.trim().toUpperCase()
        : "";
    if (!/^[A-Z]{1,5}$/.test(symbol)) return [];
    const claimed = record.assetClass;
    if (claimed === "cash" || CASH_ETFS.has(symbol)) return [];
    const assetClass =
      claimed === "bond" ? "bond" : claimed === "etf" ? "etf" : "stock";
    const weight =
      typeof record.weight === "number" ? record.weight : Number(record.weight);
    return [
      {
        symbol,
        name: typeof record.name === "string" ? record.name : symbol,
        assetClass,
        weight: Number.isFinite(weight) ? weight : 1,
        rationale: typeof record.rationale === "string" ? record.rationale : "",
      },
    ];
  });
}

export function parseInvestmentPlanDrafts(
  value: unknown
): InvestmentPlanDraft[] {
  const root =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : null;
  const plans = Array.isArray(root?.plans) ? root.plans : null;
  if (!plans) {
    throw new Error(incompleteInvestmentPlansMessage());
  }

  const byId = new Map<InvestmentPlanId, InvestmentPlanDraft>();
  for (const item of plans) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const id =
      typeof record.id === "string" ? normalizePlanId(record.id) : null;
    if (!id || byId.has(id)) continue;
    const holdings = parseDraftHoldings(record.holdings);
    if (holdings.length < MIN_HOLDINGS) continue;
    byId.set(id, {
      id,
      thesis:
        typeof record.thesis === "string"
          ? record.thesis.trim().slice(0, 280)
          : "",
      holdings,
    });
  }

  if (INVESTMENT_PLAN_ORDER.some((id) => !byId.has(id))) {
    throw new Error(incompleteInvestmentPlansMessage());
  }

  return INVESTMENT_PLAN_ORDER.map((id) => byId.get(id)!);
}

export function parseInvestmentPlanCandidates(
  raw: string
): InvestmentPlanDraft[] {
  return parseInvestmentPlanDrafts(extractFirstJsonObject(raw));
}

export function assembleInvestmentPlans(
  drafts: InvestmentPlanDraft[]
): InvestmentPlan[] {
  return INVESTMENT_PLAN_ORDER.map((id) => {
    const draft = drafts.find((item) => item.id === id);
    if (!draft) {
      throw new Error(incompleteInvestmentPlansMessage());
    }
    const spec = INVESTMENT_PLAN_SPECS[id];
    const fitted = fitPlanHoldings(id, draft.holdings);
    const holdings: InvestmentPlanHolding[] = fitted.map((holding) => ({
      ...holding,
    }));
    return {
      id,
      name: spec.name,
      summary: spec.summary,
      thesis: draft.thesis || spec.summary,
      riskScore: spec.riskScore,
      riskLabel: spec.riskLabel,
      holdings,
    };
  });
}

export function refitQuotedHoldings(
  id: InvestmentPlanId,
  holdings: InvestmentPlanHolding[]
): InvestmentPlanHolding[] {
  if (holdings.length < MIN_HOLDINGS) {
    throw new Error(
      "AI did not return enough quoted holdings for this investment plan."
    );
  }
  if (id === "aggressive-growth") {
    return scaleWeightsTo100(holdings);
  }
  return fitPlanHoldings(id, holdings).map((holding) => {
    const source = holdings.find((item) => item.symbol === holding.symbol);
    return {
      ...holding,
      price: source?.price,
      changePercent: source?.changePercent,
      trailingReturnPercent: source?.trailingReturnPercent,
    };
  });
}
