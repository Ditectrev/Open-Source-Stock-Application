"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { InvestmentPlansPanel } from "@/components/InvestmentPlansPanel";
import {
  DNA_BODY_SECONDARY,
  DNA_CAPTION,
  DNA_DISPLAY,
  DNA_PAGE_STACK,
} from "@/lib/design-dna";
import { EXPLANATIONS_PROVIDER_CHANGED_EVENT } from "@/lib/explanation-provider";
import { fetchInvestmentPlansForCurrentProvider } from "@/lib/local-ollama-investment-plans";
import { MARKET_UI_COPY } from "@/lib/market-ui-copy";
import { usePricingTier } from "@/lib/use-pricing-tier";
import type { InvestmentPlansResult } from "@/types";

export default function InvestmentPlansPage() {
  const pricingTier = usePricingTier();
  const [serverBYOKAccess, setServerBYOKAccess] = useState<boolean | null>(
    null
  );
  const hasTierAccess =
    pricingTier === "LOCAL" ||
    pricingTier === "BYOK" ||
    pricingTier === "HOSTED_AI";
  const hasAIAccess = hasTierAccess || serverBYOKAccess === true;

  const [result, setResult] = useState<InvestmentPlansResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aiProviderVersion, setAiProviderVersion] = useState(0);

  useEffect(() => {
    const onProviderChanged = () =>
      setAiProviderVersion((version) => version + 1);
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
        setResult(null);
        setLoadError(null);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchInvestmentPlansForCurrentProvider(pricingTier);
        setResult(data);
        setLoadError(null);
      } catch (err) {
        setResult(null);
        setLoadError(
          err instanceof Error
            ? err.message
            : MARKET_UI_COPY.load.investmentPlans
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [hasAIAccess, aiProviderVersion, pricingTier]);

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
    <div className={DNA_PAGE_STACK} data-testid="investment-plans-page">
      <header className="space-y-2">
        <h1 className={DNA_DISPLAY}>Investment Plans</h1>
        <p className={DNA_BODY_SECONDARY}>
          Five AI portfolio ideas: a bond-heavy defensive mix, a balanced mix of
          bonds and stocks, an equities-only growth book, a dividend plan, and a
          concentrated aggressive-growth list of strong multi-year performers.
          Each plan carries its own risk score.
        </p>
        <p className={DNA_CAPTION}>
          Research ideas for a long-term mix of listed funds and stocks. The
          Open Stock is not investment advice, and these plans are not a managed
          portfolio.{" "}
          <Link href="/ranking" className="underline underline-offset-2">
            Ranking
          </Link>
          {" · "}
          <Link
            href="/stock-of-the-day"
            className="underline underline-offset-2"
          >
            Stock of the day
          </Link>
        </p>
      </header>

      <InvestmentPlansPanel
        result={result}
        loading={loading}
        locked={!hasAIAccess}
        error={loadError}
        pricingTier={pricingTier}
      />
    </div>
  );
}
