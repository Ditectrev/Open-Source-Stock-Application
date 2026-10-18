"use client";

import {
  generateWithBrowserLocalOllama,
  isAppOpenedOnLoopbackHost,
  shouldUseBrowserLocalOllama,
} from "@/lib/browser-local-ollama";
import { getAIProviderHeaders } from "@/lib/explanation-provider";
import {
  INVESTMENT_PLANS_MAX_OUTPUT_TOKENS,
  INVESTMENT_PLANS_PROMPT,
  parseInvestmentPlanCandidates,
} from "@/lib/investment-plans";
import { MARKET_UI_COPY } from "@/lib/market-ui-copy";
import type { InvestmentPlansResult, PricingTier } from "@/types";

type InvestmentPlansApiResponse = {
  data?: InvestmentPlansResult;
  error?: string;
};

export { shouldUseBrowserLocalOllama };

export async function fetchInvestmentPlansForCurrentProvider(
  pricingTier: PricingTier | null
): Promise<InvestmentPlansResult | null> {
  const useLocalOllama = shouldUseBrowserLocalOllama(pricingTier);
  if (useLocalOllama && !isAppOpenedOnLoopbackHost()) {
    return fetchInvestmentPlansWithBrowserLocalOllama();
  }

  return fetchInvestmentPlansViaServerGet();
}

async function fetchInvestmentPlansViaServerGet(): Promise<InvestmentPlansResult | null> {
  const response = await fetch("/api/market/investment-plans", {
    headers: getAIProviderHeaders(),
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? MARKET_UI_COPY.load.investmentPlans);
  }

  const result = (await response.json()) as InvestmentPlansApiResponse;
  return result.data ?? null;
}

async function fetchInvestmentPlansWithBrowserLocalOllama(): Promise<InvestmentPlansResult | null> {
  const raw = await generateWithBrowserLocalOllama(INVESTMENT_PLANS_PROMPT, {
    numPredict: INVESTMENT_PLANS_MAX_OUTPUT_TOKENS,
    timeoutMs: 120000,
  });
  const drafts = parseInvestmentPlanCandidates(raw);

  const response = await fetch("/api/market/investment-plans", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ai-provider": "OLLAMA",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({ plans: drafts }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? MARKET_UI_COPY.load.investmentPlansValidate);
  }

  const result = (await response.json()) as InvestmentPlansApiResponse;
  return result.data ?? null;
}
