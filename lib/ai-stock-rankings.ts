import {
  extractFirstJsonObject,
  type AIStockCandidate,
} from "@/lib/stock-of-the-day-ai";
import type { AIRankingCategory, AIRankingTimeframe } from "@/types";

export type { AIRankingTimeframe, AIRankingCategory };

export const AI_RANKING_TIMEFRAMES = [
  {
    id: "short" as const,
    label: "Short term",
    horizon: "Days to weeks",
  },
  {
    id: "medium" as const,
    label: "Medium term",
    horizon: "1–6 months",
  },
  {
    id: "long" as const,
    label: "Long term",
    horizon: "1+ years",
  },
] as const;

/** Same category ids as HeatmapNavigation (etf, crypto, stock). */
export const AI_RANKING_CATEGORIES = [
  { id: "etf" as const, label: "ETFs" },
  { id: "crypto" as const, label: "Crypto" },
  { id: "stock" as const, label: "Stocks" },
] as const;

export const AI_STOCK_RANKINGS_MAX_OUTPUT_TOKENS = 4096;

export const AI_STOCK_RANKINGS_CANDIDATE_COUNT = 8;

export const AI_STOCK_RANKINGS_DISPLAY_COUNT = 5;

export type AIStockRankingsCandidates = {
  buyCandidates: AIStockCandidate[];
  sellCandidates: AIStockCandidate[];
};

const TIMEFRAME_PROMPT_CONTEXT: Record<
  AIRankingTimeframe,
  { horizon: string; focus: string }
> = {
  short: {
    horizon: "days to a few weeks",
    focus:
      "near-term catalysts, momentum, technical breakouts, earnings reactions, and short-swing setups",
  },
  medium: {
    horizon: "one to six months",
    focus:
      "intermediate trends, estimate revisions, sector rotation, and setups that need a few quarters to play out",
  },
  long: {
    horizon: "one year or longer",
    focus:
      "durable growth narratives, compounding businesses, valuation vs runway, and structural winners",
  },
};

const CATEGORY_PROMPT_CONTEXT: Record<
  AIRankingCategory,
  { assetLabel: string; assetRules: string; symbolRules: string }
> = {
  etf: {
    assetLabel: "US-listed ETFs",
    assetRules:
      "- Rank liquid exchange-traded funds only.\n- Do not include individual stocks, crypto, mutual funds, or closed-end funds.",
    symbolRules: "Use ETF tickers only (e.g. SPY, QQQ), no exchange suffixes.",
  },
  crypto: {
    assetLabel: "major cryptocurrencies",
    assetRules:
      "- Rank liquid crypto assets that Yahoo Finance quotes.\n- Do not include stocks, ETFs, or stablecoins unless the thesis is unusually differentiated.",
    symbolRules:
      "Use Yahoo Finance crypto symbols with -USD suffix (e.g. BTC-USD, ETH-USD).",
  },
  stock: {
    assetLabel: "US-listed common stocks",
    assetRules:
      "- Do not include ETFs, crypto, ADRs, funds, warrants, or preferred shares.",
    symbolRules: "Use tickers only, no exchange suffixes.",
  },
};

export function isAIRankingTimeframe(
  value: string
): value is AIRankingTimeframe {
  return value === "short" || value === "medium" || value === "long";
}

export function isAIRankingCategory(value: string): value is AIRankingCategory {
  return value === "etf" || value === "crypto" || value === "stock";
}

export function getAIRankingCategoryLabel(category: AIRankingCategory): string {
  return (
    AI_RANKING_CATEGORIES.find((item) => item.id === category)?.label ??
    category
  );
}

export function rankingInsufficientCandidatesMessage(
  category: AIRankingCategory
): string {
  return `AI did not return enough valid ${getAIRankingCategoryLabel(category).toLowerCase()} candidates for this ranking.`;
}

export function rankingIncompleteCandidatesMessage(
  category: AIRankingCategory
): string {
  return `AI returned an incomplete ${getAIRankingCategoryLabel(category).toLowerCase()} ranking candidate set.`;
}

function normalizeRankingSymbol(
  raw: string,
  category: AIRankingCategory
): string | null {
  const symbol = raw.trim().toUpperCase();
  if (!symbol) return null;

  switch (category) {
    case "stock":
    case "etf":
      return /^[A-Z]{1,5}$/.test(symbol) ? symbol : null;
    case "crypto":
      if (/^[A-Z0-9]{2,10}-USD$/.test(symbol)) return symbol;
      if (/^[A-Z0-9]{2,10}$/.test(symbol)) return `${symbol}-USD`;
      return null;
  }
}

export function parseAIRankingCandidates(
  value: unknown,
  category: AIRankingCategory
): AIStockCandidate[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  return value
    .map((item): AIStockCandidate | null => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as Record<string, unknown>;
      const rawSymbol =
        typeof candidate.symbol === "string" ? candidate.symbol : "";
      const symbol = normalizeRankingSymbol(rawSymbol, category);
      if (!symbol || seen.has(symbol)) return null;
      seen.add(symbol);
      return {
        symbol,
        name:
          typeof candidate.name === "string"
            ? candidate.name.trim()
            : undefined,
        thesis:
          typeof candidate.thesis === "string"
            ? candidate.thesis.trim()
            : undefined,
      };
    })
    .filter((item): item is AIStockCandidate => item !== null)
    .slice(0, AI_STOCK_RANKINGS_CANDIDATE_COUNT);
}

export function buildAIStockRankingsPrompt(
  timeframe: AIRankingTimeframe,
  category: AIRankingCategory
): string {
  const context = TIMEFRAME_PROMPT_CONTEXT[timeframe];
  const categoryContext = CATEGORY_PROMPT_CONTEXT[category];

  return `You are a markets analyst building a premium AI ranking list for ${categoryContext.assetLabel} over the ${context.horizon} horizon.
Return ONLY valid JSON, no markdown, in this exact shape:
{
  "buyCandidates": [{"symbol": string, "name": string, "thesis": string}],
  "sellCandidates": [{"symbol": string, "name": string, "thesis": string}]
}

Task:
- Rank the most promising ${categoryContext.assetLabel} to BUY for a ${context.horizon} investment horizon.
- Rank the most compelling ${categoryContext.assetLabel} to SELL for the same ${context.horizon} horizon.
- Focus on ${context.focus}.
- Return exactly ${AI_STOCK_RANKINGS_CANDIDATE_COUNT} distinct buy candidates and ${AI_STOCK_RANKINGS_CANDIDATE_COUNT} distinct sell candidates, each ordered from most to least compelling for this horizon.

Rules:
${categoryContext.assetRules}
- Prefer liquid assets that Yahoo Finance can quote.
- thesis must be one short sentence explaining why the asset ranks highly for this horizon and side.
- ${categoryContext.symbolRules}
- Avoid repeating the same mega-cap default unless the thesis is unusually differentiated for this horizon.`;
}

export function parseAIStockRankingsCandidates(
  raw: string,
  category: AIRankingCategory
): AIStockRankingsCandidates {
  const parsed = extractFirstJsonObject(raw);
  const buyCandidates = parseAIRankingCandidates(
    parsed?.buyCandidates,
    category
  );
  const sellCandidates = parseAIRankingCandidates(
    parsed?.sellCandidates,
    category
  );

  if (buyCandidates.length < 4 || sellCandidates.length < 4) {
    throw new Error(rankingIncompleteCandidatesMessage(category));
  }

  return {
    buyCandidates,
    sellCandidates,
  };
}
