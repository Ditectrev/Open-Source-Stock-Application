import type { PricingTier } from "@/types";

function readEnv(key: string): string {
  const value = process.env[key];
  return typeof value === "string" ? value.trim() : "";
}

const STRIPE_PRICE_BY_TIER: Record<Exclude<PricingTier, "FREE">, string> = {
  ADS_FREE: readEnv("STRIPE_PRICE_ADS_FREE"),
  LOCAL: readEnv("STRIPE_PRICE_LOCAL"),
  BYOK: readEnv("STRIPE_PRICE_BYOK"),
  HOSTED_AI: readEnv("STRIPE_PRICE_HOSTED_AI"),
};

export function getStripeSecretKey(): string {
  return readEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret(): string {
  return readEnv("STRIPE_WEBHOOK_SECRET");
}

export function getStripePriceByTier(
  tier: Exclude<PricingTier, "FREE">
): string {
  return STRIPE_PRICE_BY_TIER[tier];
}

export function getTierByStripePriceId(priceId: string): PricingTier {
  const normalized = priceId.trim();
  const match = Object.entries(STRIPE_PRICE_BY_TIER).find(
    ([, configuredPriceId]) => configuredPriceId === normalized
  );
  return (match?.[0] as PricingTier | undefined) ?? "FREE";
}

export function hasStripePriceForTier(
  tier: Exclude<PricingTier, "FREE">
): boolean {
  return getStripePriceByTier(tier) !== "";
}
