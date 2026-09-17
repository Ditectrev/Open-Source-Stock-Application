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
  AIRankingTimeframe,
  PricingTier,
} from "@/types";

type AIStockRankingsApiResponse = {
  data?: AIStockRankingsResult;
  error?: string;
};

export async function fetchAIStockRankingsForCurrentProvider(
  timeframe: AIRankingTimeframe,
  pricingTier: PricingTier | null
): Promise<AIStockRankingsResult | null> {
  const useLocalOllama = shouldUseBrowserLocalOllama(pricingTier);
  if (useLocalOllama && !isAppOpenedOnLoopbackHost()) {
    return fetchAIStockRankingsWithBrowserLocalOllama(timeframe);
  }

  return fetchAIStockRankingsViaServerGet(timeframe);
}

async function fetchAIStockRankingsViaServerGet(
  timeframe: AIRankingTimeframe
): Promise<AIStockRankingsResult | null> {
  const response = await fetch(
    `/api/market/ranking?timeframe=${encodeURIComponent(timeframe)}`,
    {
      headers: getAIProviderHeaders(),
      credentials: "include",
      cache: "no-store",
    }
  );

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
  timeframe: AIRankingTimeframe
): Promise<AIStockRankingsResult | null> {
  const raw = await generateWithBrowserLocalOllama(
    buildAIStockRankingsPrompt(timeframe)
  );
  const { buyCandidates, sellCandidates } = parseAIStockRankingsCandidates(raw);

  const response = await fetch("/api/market/ranking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ai-provider": "OLLAMA",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({ timeframe, buyCandidates, sellCandidates }),
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
