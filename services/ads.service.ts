/**
 * Ads Service
 * Manages ad display logic for the Free tier.
 * Requirements: 22.5, 22.6, 22.7
 */

import { logger } from "@/lib/logger";
import { PricingTier } from "@/types";

export type AdPlacement = "banner-top" | "banner-bottom" | "sidebar" | "inline";

export interface AdConfig {
  placement: AdPlacement;
  /** Ad provider slot/unit ID */
  slotId: string;
  width: number;
  height: number;
}

// Ad slot configuration per placement
const AD_SLOTS: Record<AdPlacement, AdConfig> = {
  "banner-top": {
    placement: "banner-top",
    slotId: "top-banner-001",
    width: 728,
    height: 90,
  },
  "banner-bottom": {
    placement: "banner-bottom",
    slotId: "bottom-banner-001",
    width: 728,
    height: 90,
  },
  sidebar: {
    placement: "sidebar",
    slotId: "sidebar-001",
    width: 300,
    height: 250,
  },
  inline: { placement: "inline", slotId: "inline-001", width: 468, height: 60 },
};

export class AdsService {
  /**
   * Returns whether ads should be shown for the given pricing tier.
   * Only the FREE tier displays ads. Requirement: 22.5, 22.6
   */
  shouldShowAds(tier: PricingTier): boolean {
    return tier === "FREE";
  }

  /**
   * Returns the ad configuration for a given placement.
   * Requirement: 22.5
   */
  getAdConfig(placement: AdPlacement): AdConfig {
    return AD_SLOTS[placement];
  }

  /**
   * Logs an ad impression for analytics.
   * Requirement: 22.6
   */
  trackImpression(placement: AdPlacement, tier: PricingTier): void {
    if (!this.shouldShowAds(tier)) return;
    logger.info("Ad impression", { placement, tier });
  }

  /**
   * Logs an ad click for analytics.
   * Requirement: 22.6
   */
  trackClick(placement: AdPlacement, tier: PricingTier): void {
    if (!this.shouldShowAds(tier)) return;
    logger.info("Ad click", { placement, tier });
  }
}

export const adsService = new AdsService();
