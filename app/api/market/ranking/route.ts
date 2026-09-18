import { NextRequest, NextResponse } from "next/server";
import { MARKET_UI_COPY, userFacingApiError } from "@/lib/api-user-error";
import {
  isAIRankingCategory,
  isAIRankingTimeframe,
  parseAIRankingCandidates,
} from "@/lib/ai-stock-rankings";
import { aiMarketInsightsService } from "@/services/ai-market-insights.service";
import { logger } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { subscriptionService } from "@/services/subscription.service";
import { resolveMarketRouteLLMConfig } from "@/lib/resolve-market-ai-llm-config";

export async function GET(request: NextRequest) {
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

    const timeframeRaw =
      request.nextUrl.searchParams.get("timeframe")?.trim().toLowerCase() ??
      "short";
    if (!isAIRankingTimeframe(timeframeRaw)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid timeframe. Use short, medium, or long.",
        },
        { status: 400 }
      );
    }

    const categoryRaw =
      request.nextUrl.searchParams.get("category")?.trim().toLowerCase() ??
      "stock";
    if (!isAIRankingCategory(categoryRaw)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category. Use etf, crypto, or stock.",
        },
        { status: 400 }
      );
    }

    const requestedProviderRaw =
      request.headers.get("x-ai-provider")?.trim().toUpperCase() ?? "";

    const resolved = await resolveMarketRouteLLMConfig({
      tier,
      userId: auth.id,
      requestedProviderRaw,
    });
    if (!resolved.ok) {
      logger.warn("Ranking: no LLM credentials", {
        userId: auth.id,
        tier,
        detail: resolved.error,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            resolved.error ??
            "AI is available on your plan, but this deployment has no active provider configuration for rankings.",
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }

    const data = await aiMarketInsightsService.getAIStockRankings(
      timeframeRaw,
      categoryRaw,
      resolved.llmConfig
    );

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to load Ranking", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: userFacingApiError(error, MARKET_UI_COPY.load.aiStockRankings),
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const tier = await subscriptionService.getCurrentTier(auth.id);
    if (!["LOCAL", "BYOK"].includes(tier)) {
      return NextResponse.json(
        { success: false, error: "Local or BYOK AI tier required" },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      timeframe?: unknown;
      category?: unknown;
      buyCandidates?: unknown;
      sellCandidates?: unknown;
    } | null;

    const timeframeRaw =
      typeof body?.timeframe === "string"
        ? body.timeframe.trim().toLowerCase()
        : "short";
    if (!isAIRankingTimeframe(timeframeRaw)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid timeframe. Use short, medium, or long.",
        },
        { status: 400 }
      );
    }

    const categoryRaw =
      typeof body?.category === "string"
        ? body.category.trim().toLowerCase()
        : "stock";
    if (!isAIRankingCategory(categoryRaw)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category. Use etf, crypto, or stock.",
        },
        { status: 400 }
      );
    }

    const buyCandidates = parseAIRankingCandidates(
      body?.buyCandidates,
      categoryRaw
    );
    const sellCandidates = parseAIRankingCandidates(
      body?.sellCandidates,
      categoryRaw
    );
    if (buyCandidates.length < 4 || sellCandidates.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: "AI returned an incomplete stock ranking candidate set.",
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }

    const data = await aiMarketInsightsService.enrichAIStockRankingsCandidates(
      timeframeRaw,
      categoryRaw,
      { buyCandidates, sellCandidates }
    );

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to validate local Ranking candidates", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: userFacingApiError(
          error,
          MARKET_UI_COPY.load.aiStockRankingsValidate
        ),
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
