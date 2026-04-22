import { NextRequest, NextResponse } from "next/server";
import { aiMarketInsightsService } from "@/services/ai-market-insights.service";
import { logger } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { subscriptionService } from "@/services/subscription.service";
import { appwriteAIKeyStoreService } from "@/services/appwrite-ai-key-store.service";
import type { AIProvider } from "@/types";
import type { BYOKProvider } from "@/services/api-key-manager.service";

function isBYOKProvider(value: string): value is BYOKProvider {
  return ["OPENAI", "GEMINI", "MISTRAL", "DEEPSEEK"].includes(value);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const tier = await subscriptionService.getCurrentTier(auth.id);
    if (!["LOCAL", "BYOK", "HOSTED_AI"].includes(tier)) {
      return NextResponse.json(
        { success: false, error: "Paid AI tier required" },
        { status: 403 }
      );
    }

    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: "Symbol parameter is required" },
        { status: 400 }
      );
    }

    const requestedProviderRaw =
      request.headers.get("x-ai-provider")?.trim().toUpperCase() ?? "";
    const model = process.env.AI_MODEL;

    let llmConfig:
      | {
          provider: AIProvider;
          apiKey?: string;
          model?: string;
        }
      | undefined;

    if (tier === "LOCAL") {
      llmConfig = {
        provider: "OLLAMA",
        model: process.env.OLLAMA_MODEL ?? model,
      };
    } else if (tier === "BYOK") {
      const requestedProvider = isBYOKProvider(requestedProviderRaw)
        ? requestedProviderRaw
        : null;
      const provider =
        requestedProvider ??
        (await appwriteAIKeyStoreService.getPreferredProvider(auth.id));
      if (!provider) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No BYOK API key found. Save a provider key in profile first.",
          },
          { status: 403 }
        );
      }
      const apiKey = await appwriteAIKeyStoreService.getDecryptedKey(
        auth.id,
        provider
      );
      if (!apiKey) {
        return NextResponse.json(
          {
            success: false,
            error: `No API key stored for provider ${provider}. Change provider in profile or save a key for ${provider}.`,
          },
          { status: 403 }
        );
      }
      llmConfig = { provider, apiKey, model };
    }

    const data = await aiMarketInsightsService.generatePrediction(
      symbol,
      llmConfig
    );

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    const { symbol } = await params;
    logger.error("Failed to generate AI prediction", error as Error, {
      symbol,
    });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate AI prediction",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
