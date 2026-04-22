"use client";

/**
 * Hook to retrieve the current user's pricing tier.
 * Falls back to FREE for unauthenticated / trial users.
 */

import { useState, useEffect } from "react";
import { PricingTier } from "@/types";

export function usePricingTier(): PricingTier {
  const [tier, setTier] = useState<PricingTier>("FREE");

  useEffect(() => {
    const loadTier = async () => {
      try {
        const response = await fetch("/api/subscription/current", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) {
          setTier("FREE");
          return;
        }
        const data = (await response.json()) as {
          data?: { tier?: PricingTier };
        };
        setTier(data.data?.tier ?? "FREE");
      } catch {
        setTier("FREE");
      }
    };

    void loadTier();
    const onAuthChanged = () => void loadTier();
    const onFocus = () => void loadTier();
    const onVisibility = () => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "visible"
      ) {
        void loadTier();
      }
    };
    const intervalId = window.setInterval(() => void loadTier(), 15000);

    if (typeof window !== "undefined") {
      window.addEventListener("auth-state-changed", onAuthChanged);
      window.addEventListener("focus", onFocus);
      document.addEventListener("visibilitychange", onVisibility);
    }
    return () => {
      window.clearInterval(intervalId);
      if (typeof window !== "undefined") {
        window.removeEventListener("auth-state-changed", onAuthChanged);
        window.removeEventListener("focus", onFocus);
        document.removeEventListener("visibilitychange", onVisibility);
      }
    };
  }, []);

  return tier;
}
