import {
  extractFirstJsonObject,
  parseAIStockCandidates,
  type AIStockCandidate,
} from "@/lib/stock-of-the-day-ai";
import type { AIRankingTimeframe } from "@/types";

export type { AIRankingTimeframe };

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

export function isAIRankingTimeframe(
  value: string
): value is AIRankingTimeframe {
  return value === "short" || value === "medium" || value === "long";
}

export function buildAIStockRankingsPrompt(
  timeframe: AIRankingTimeframe
): string {
  const context = TIMEFRAME_PROMPT_CONTEXT[timeframe];

  return `You are an equity research analyst building a premium AI stock ranking list for the ${context.horizon} horizon.
Return ONLY valid JSON, no markdown, in this exact shape:
{
  "buyCandidates": [{"symbol": string, "name": string, "thesis": string}],
  "sellCandidates": [{"symbol": string, "name": string, "thesis": string}]
}

Task:
- Rank the most promising US-listed common stocks to BUY for a ${context.horizon} investment horizon.
- Rank the most compelling US-listed common stocks to SELL for the same ${context.horizon} horizon.
- Focus on ${context.focus}.
- Return exactly ${AI_STOCK_RANKINGS_CANDIDATE_COUNT} distinct buy candidates and ${AI_STOCK_RANKINGS_CANDIDATE_COUNT} distinct sell candidates, each ordered from most to least compelling for this horizon.

Rules:
- Do not include ETFs, crypto, ADRs, funds, warrants, or preferred shares.
- Prefer liquid public companies that Yahoo Finance can quote.
- thesis must be one short sentence explaining why the stock ranks highly for this horizon and side.
- Use tickers only, no exchange suffixes.
- Avoid repeating the same mega-cap default unless the thesis is unusually differentiated for this horizon.`;
}

export function parseAIStockRankingsCandidates(
  raw: string
): AIStockRankingsCandidates {
  const parsed = extractFirstJsonObject(raw);
  const buyCandidates = parseAIStockCandidates(parsed?.buyCandidates);
  const sellCandidates = parseAIStockCandidates(parsed?.sellCandidates);

  if (buyCandidates.length < 4 || sellCandidates.length < 4) {
    throw new Error("AI returned an incomplete stock ranking candidate set.");
  }

  return {
    buyCandidates: buyCandidates.slice(0, AI_STOCK_RANKINGS_CANDIDATE_COUNT),
    sellCandidates: sellCandidates.slice(0, AI_STOCK_RANKINGS_CANDIDATE_COUNT),
  };
}
