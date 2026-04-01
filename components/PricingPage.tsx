"use client";

/**
 * PricingPage component
 * Displays all five pricing tiers in a comparison format.
 * Requirements: 22.1, 22.2, 22.3, 22.4
 */

import { useState } from "react";
import { PricingTier, PricingTierInfo } from "@/types";

const CHECK_ICON = (
  <svg
    className="w-4 h-4 text-green-500 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

interface PricingCardProps {
  tier: PricingTierInfo;
  isPopular?: boolean;
  onSelect: (tier: PricingTier) => void;
  isCurrentTier?: boolean;
}

function PricingCard({
  tier,
  isPopular,
  onSelect,
  isCurrentTier,
}: PricingCardProps) {
  const isFree = tier.price === 0;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-shadow
        ${
          isPopular
            ? "border-blue-500 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20"
            : "border-gray-200 dark:border-gray-700"
        }
        bg-white dark:bg-gray-900`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {tier.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 min-h-[40px]">
          {tier.description}
        </p>
      </div>

      {/* Price */}
      <div className="mb-6">
        {isFree ? (
          <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
            Free
          </span>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
              ${tier.price}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              / mo
            </span>
          </div>
        )}
      </div>

      {/* CTA button */}
      <button
        onClick={() => onSelect(tier.tier)}
        disabled={isCurrentTier}
        className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors mb-6
          ${
            isCurrentTier
              ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-default"
              : isPopular
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-900 hover:bg-gray-700 text-white dark:bg-gray-100 dark:hover:bg-gray-300 dark:text-gray-900"
          }`}
        aria-label={
          isCurrentTier
            ? `Current plan: ${tier.name}`
            : `Get started with ${tier.name}`
        }
      >
        {isCurrentTier ? "Current plan" : isFree ? "Get started" : "Subscribe"}
      </button>

      {/* Feature list */}
      <ul className="space-y-2.5 flex-1" aria-label={`${tier.name} features`}>
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            {CHECK_ICON}
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface PricingPageProps {
  tiers: PricingTierInfo[];
  currentTier?: PricingTier;
  onSelectTier?: (tier: PricingTier) => void;
}

export function PricingPage({
  tiers,
  currentTier,
  onSelectTier,
}: PricingPageProps) {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

  const handleSelect = (tier: PricingTier) => {
    setSelectedTier(tier);
    onSelectTier?.(tier);
  };

  return (
    <section
      className="py-12 px-4 max-w-7xl mx-auto"
      aria-labelledby="pricing-heading"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <h2
          id="pricing-heading"
          className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl"
        >
          Simple, transparent pricing
        </h2>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Start free. Upgrade when you need AI features or an ad-free
          experience.
        </p>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {tiers.map((tier) => (
          <PricingCard
            key={tier.tier}
            tier={tier}
            isPopular={tier.tier === "ADS_FREE"}
            isCurrentTier={currentTier === tier.tier}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Confirmation feedback */}
      {selectedTier && selectedTier !== currentTier && (
        <p
          className="mt-8 text-center text-sm text-blue-600 dark:text-blue-400"
          role="status"
          aria-live="polite"
        >
          You selected{" "}
          <strong>{tiers.find((t) => t.tier === selectedTier)?.name}</strong>.
          Complete checkout to activate.
        </p>
      )}

      {/* Footer note */}
      <p className="mt-10 text-center text-xs text-gray-400 dark:text-gray-500">
        All paid plans include a 7-day money-back guarantee. Cancel anytime.
      </p>
    </section>
  );
}
