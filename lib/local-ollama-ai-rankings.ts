"use client";

import {
  generateWithBrowserLocalOllama,
  isAppOpenedOnLoopbackHost,
  shouldUseBrowserLocalOllama,
} from "@/lib/browser-local-ollama";
import {
  buildAIStockRankingsPrompt,
  parseAIStockRankingsCandidates,
} from "@/lib/ai-stock-rankings";
import { getAIProviderHeaders } from "@/lib/explanation-provider";
import { MARKET_UI_COPY } from "@/lib/market-ui-copy";
import type {
  AIStockRankingsResult,
  AIRankingCategory,
  AIRankingTimeframe,
  PricingTier,
} from "@/types";

type AIStockRankingsApiResponse = {
  data?: AIStockRankingsResult;
  error?: string;
};

export async function fetchAIStockRankingsForCurrentProvider(
  timeframe: AIRankingTimeframe,
  category: AIRankingCategory,
  pricingTier: PricingTier | null
): Promise<AIStockRankingsResult | null> {
  const useLocalOllama = shouldUseBrowserLocalOllama(pricingTier);
  if (useLocalOllama && !isAppOpenedOnLoopbackHost()) {
    return fetchAIStockRankingsWithBrowserLocalOllama(timeframe, category);
  }

  return fetchAIStockRankingsViaServerGet(timeframe, category);
}

async function fetchAIStockRankingsViaServerGet(
  timeframe: AIRankingTimeframe,
  category: AIRankingCategory
): Promise<AIStockRankingsResult | null> {
  const params = new URLSearchParams({
    timeframe,
    category,
  });
  const response = await fetch(`/api/market/ranking?${params.toString()}`, {
    headers: getAIProviderHeaders(),
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? MARKET_UI_COPY.load.aiStockRankings);
  }

  const result = (await response.json()) as AIStockRankingsApiResponse;
  return result.data ?? null;
}

async function fetchAIStockRankingsWithBrowserLocalOllama(
  timeframe: AIRankingTimeframe,
  category: AIRankingCategory
): Promise<AIStockRankingsResult | null> {
  const raw = await generateWithBrowserLocalOllama(
    buildAIStockRankingsPrompt(timeframe, category)
  );
  const { buyCandidates, sellCandidates } = parseAIStockRankingsCandidates(
    raw,
    category
  );

  const response = await fetch("/api/market/ranking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ai-provider": "OLLAMA",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      timeframe,
      category,
      buyCandidates,
      sellCandidates,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? MARKET_UI_COPY.load.aiStockRankingsValidate);
  }

  const result = (await response.json()) as AIStockRankingsApiResponse;
  return result.data ?? null;
}
