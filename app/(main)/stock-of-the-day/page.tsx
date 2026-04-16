"use client";

import { useEffect, useState } from "react";
import { usePricingTier } from "@/lib/use-pricing-tier";
import { StockOfTheDayPanel } from "@/components/StockOfTheDayPanel";
import type { StockOfTheDay } from "@/types";

export default function StockOfTheDayPage() {
  const pricingTier = usePricingTier();
  const hasAIAccess =
    pricingTier === "LOCAL" || pricingTier === "BYOK" || pricingTier === "HOSTED_AI";

  const [item, setItem] = useState<StockOfTheDay | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!hasAIAccess) {
        setItem(null);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/market/stock-of-the-day");
        if (!response.ok) {
          throw new Error("Failed to load stock of the day");
        }
        const result = await response.json();
        setItem(result.data ?? null);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hasAIAccess]);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
        Stock of the day
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        AI-ranked daily opportunity across stocks and select liquid assets.
      </p>

      <StockOfTheDayPanel item={item} loading={loading} locked={!hasAIAccess} />
    </div>
  );
}
