"use client";

/**
 * AdBanner component
 * Renders an ad unit for Free tier users. Hidden for all paid tiers.
 * Requirements: 22.5, 22.7
 */

import { useEffect, useRef } from "react";
import { adsService, AdPlacement } from "@/services/ads.service";
import { PricingTier } from "@/types";

export interface AdBannerProps {
  placement: AdPlacement;
  tier: PricingTier;
  className?: string;
}

export function AdBanner({ placement, tier, className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Requirement 22.7: hide ads for all paid tiers
  if (!adsService.shouldShowAds(tier)) return null;

  const config = adsService.getAdConfig(placement);

  return (
    <AdBannerInner
      config={config}
      placement={placement}
      tier={tier}
      containerRef={containerRef}
      className={className}
    />
  );
}

// Inner component so hooks run unconditionally after the early return guard
function AdBannerInner({
  config,
  placement,
  tier,
  containerRef,
  className,
}: {
  config: ReturnType<typeof adsService.getAdConfig>;
  placement: AdPlacement;
  tier: PricingTier;
  containerRef: React.RefObject<HTMLDivElement | null>;
  className: string;
}) {
  useEffect(() => {
    adsService.trackImpression(placement, tier);
  }, [placement, tier]);

  const handleClick = () => {
    adsService.trackClick(placement, tier);
  };

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}
      style={{
        width: "100%",
        maxWidth: config.width,
        minHeight: config.height,
      }}
      role="complementary"
      aria-label="Advertisement"
      onClick={handleClick}
    >
      {/* Placeholder — replace inner content with real ad provider script/iframe */}
      <div className="flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-gray-500 select-none pointer-events-none">
        <span className="text-xs font-medium uppercase tracking-wide">
          Advertisement
        </span>
        <span className="text-xs opacity-60">
          {config.width}×{config.height}
        </span>
      </div>
    </div>
  );
}
