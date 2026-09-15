"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePricingTier } from "@/lib/use-pricing-tier";
import { EXPLANATIONS_PROVIDER_CHANGED_EVENT } from "@/lib/explanation-provider";
import { fetchAIStockRankingsForCurrentProvider } from "@/lib/local-ollama-ai-rankings";
import { MARKET_UI_COPY } from "@/lib/market-ui-copy";
import {
  DNA_BODY_SECONDARY,
  DNA_CAPTION,
  DNA_DISPLAY,
  DNA_PAGE_STACK,
} from "@/lib/design-dna";
import type { AIRankingTimeframe } from "@/lib/ai-stock-rankings";
import type { AIStockRankingsResult } from "@/types";
import { AIStockRankingsPanel } from "@/components/AIStockRankingsPanel";

export default function AIStockRankingsPage() {
  const pricingTier = usePricingTier();
  const [serverBYOKAccess, setServerBYOKAccess] = useState<boolean | null>(
    null
  );
  const hasTierAccess =
    pricingTier === "LOCAL" ||
    pricingTier === "BYOK" ||
    pricingTier === "HOSTED_AI";
  const hasAIAccess = hasTierAccess || serverBYOKAccess === true;

  const [timeframe, setTimeframe] = useState<AIRankingTimeframe>("short");
  const [data, setData] = useState<AIStockRankingsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aiProviderVersion, setAiProviderVersion] = useState(0);

  useEffect(() => {
    const onProviderChanged = () => setAiProviderVersion((v) => v + 1);
    window.addEventListener(
      EXPLANATIONS_PROVIDER_CHANGED_EVENT,
      onProviderChanged
    );
    return () =>
      window.removeEventListener(
        EXPLANATIONS_PROVIDER_CHANGED_EVENT,
        onProviderChanged
      );
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!hasAIAccess) {
        setData(null);
        setLoadError(null);
        return;
      }

      setLoading(true);
      try {
        const result = await fetchAIStockRankingsForCurrentProvider(
          timeframe,
          pricingTier
        );
        setData(result);
        setLoadError(null);
      } catch (err) {
        setData(null);
        setLoadError(
          err instanceof Error ? err.message : MARKET_UI_COPY.load.aiStockRankings
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hasAIAccess, aiProviderVersion, pricingTier, timeframe]);

  useEffect(() => {
    const loadBYOKAccess = async () => {
      try {
        const response = await fetch("/api/ai/keys", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        setServerBYOKAccess(response.ok);
      } catch {
        setServerBYOKAccess(false);
      }
    };
    void loadBYOKAccess();
    const onAuthChanged = () => void loadBYOKAccess();
    if (typeof window !== "undefined") {
      window.addEventListener("auth-state-changed", onAuthChanged);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth-state-changed", onAuthChanged);
      }
    };
  }, []);

  return (
    <div className={DNA_PAGE_STACK} data-testid="ai-stock-rankings-page">
      <header className="space-y-2">
        <h1 className={DNA_DISPLAY}>AI stock rankings</h1>
        <p className={DNA_BODY_SECONDARY}>
          AI-ranked lists of the most promising stocks across short, medium, and
          long horizons — each with a clear rationale.
        </p>
        <p className={DNA_CAPTION}>
          Related:{" "}
          <Link href="/stock-of-the-day" className="underline underline-offset-2">
            Stock of the day
          </Link>
        </p>
      </header>

      <AIStockRankingsPanel
        data={data}
        loading={loading}
        locked={!hasAIAccess}
        error={loadError}
        pricingTier={pricingTier}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />
    </div>
  );
}
