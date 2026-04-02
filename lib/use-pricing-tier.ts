"use client";

/**
 * Hook to retrieve the current user's pricing tier.
 * Falls back to FREE for unauthenticated / trial users.
 */

import { useState, useEffect } from "react";
import { PricingTier } from "@/types";

const STORAGE_KEY = "pricing_tier";

export function usePricingTier(): PricingTier {
  const [tier, setTier] = useState<PricingTier>("FREE");

  useEffect(() => {
    // In a full implementation this would read from the authenticated user's
    // session / Appwrite profile. For now we read from localStorage so that
    // the PricingPage can persist a selection for demo purposes.
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as PricingTier | null;
      if (stored) setTier(stored);
    } catch {
      // localStorage unavailable — default to FREE
    }
  }, []);

  return tier;
}
