"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { PricingTier, PricingTierInfo } from "@/types";

const PricingPage = dynamic(
  () => import("@/components/PricingPage").then((m) => m.PricingPage),
  {
    loading: () => <LoadingSpinner size="md" message="Loading pricing..." />,
    ssr: false,
  }
);

export default function PricingRoutePage() {
  const [tiers, setTiers] = useState<PricingTierInfo[]>([]);
  const [currentTier, setCurrentTier] = useState<PricingTier>("FREE");
  const [message, setMessage] = useState<string | null>(null);

  const paidTierSet = useMemo(
    () => new Set<PricingTier>(["ADS_FREE", "LOCAL", "BYOK", "HOSTED_AI"]),
    []
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tiersRes, currentRes] = await Promise.all([
          fetch("/api/subscription/tiers", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/subscription/current", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (tiersRes.ok) {
          const tiersData = (await tiersRes.json()) as {
            data?: PricingTierInfo[];
          };
          setTiers(tiersData.data ?? []);
        }
        if (currentRes.ok) {
          const currentData = (await currentRes.json()) as {
            data?: { tier?: PricingTier };
          };
          setCurrentTier(currentData.data?.tier ?? "FREE");
        }
      } catch {
        setMessage("Failed to load pricing details. Please refresh.");
      }
    };

    void loadData();
  }, []);

  const handleSelectTier = async (tier: PricingTier) => {
    if (!paidTierSet.has(tier)) {
      setMessage("Free tier is already active by default.");
      return;
    }
    setMessage(null);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tier }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        data?: { url?: string };
        error?: string;
      };
      if (!response.ok || !payload.data?.url) {
        setMessage(payload.error ?? "Failed to start checkout.");
        return;
      }
      window.location.assign(payload.data.url);
    } catch {
      setMessage("Failed to start checkout.");
    }
  };

  return (
    <div className="mt-6 sm:mt-8 lg:mt-10">
      <PricingPage
        tiers={tiers}
        currentTier={currentTier}
        onSelectTier={handleSelectTier}
      />
      {message && (
        <p className="mt-4 text-center text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
