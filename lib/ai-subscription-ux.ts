import type { PricingTier } from "@/types";

/**
 * Copy for AI-gated panels when the user has no AI-enabled subscription.
 */
export function getAiSubscriptionGateMessage(
  tier: PricingTier | null | undefined
): string {
  if (tier === "FREE" || tier === "ADS_FREE") {
    return "Your current plan does not include AI. Upgrade to Local AI for Ollama on your machine, Bring Your Own Key for OpenAI/Gemini/Mistral/DeepSeek, or Ditectrev AI for managed AI.";
  }
  return "Enable a Local AI, Bring Your Own Key, or Ditectrev AI subscription to unlock this section.";
}
