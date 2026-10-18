import { NextRequest, NextResponse } from "next/server";
import { MARKET_UI_COPY, userFacingApiError } from "@/lib/api-user-error";
import { parseInvestmentPlanDrafts } from "@/lib/investment-plans";
import { aiMarketInsightsService } from "@/services/ai-market-insights.service";
import { logger } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { subscriptionService } from "@/services/subscription.service";
import { resolveMarketRouteLLMConfig } from "@/lib/resolve-market-ai-llm-config";

const PAID_AI_TIERS = ["LOCAL", "BYOK", "HOSTED_AI"];

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
    if (!PAID_AI_TIERS.includes(tier)) {
      return NextResponse.json(
        { success: false, error: "Paid AI tier required" },
        { status: 403 }
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
      logger.warn("Investment plans: no LLM credentials", {
        userId: auth.id,
        tier,
        detail: resolved.error,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            resolved.error ??
            "AI is available on your plan, but this deployment has no active provider configuration for investment plans.",
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }

    const data = await aiMarketInsightsService.getInvestmentPlans(
      resolved.llmConfig
    );

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to load investment plans", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: userFacingApiError(error, MARKET_UI_COPY.load.investmentPlans),
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
      plans?: unknown;
    } | null;

    let drafts;
    try {
      drafts = parseInvestmentPlanDrafts(body);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: userFacingApiError(
            error,
            MARKET_UI_COPY.load.investmentPlansValidate
          ),
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }

    const data = await aiMarketInsightsService.enrichInvestmentPlans(drafts);

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error(
      "Failed to validate local investment plan ideas",
      error as Error
    );

    return NextResponse.json(
      {
        success: false,
        error: userFacingApiError(
          error,
          MARKET_UI_COPY.load.investmentPlansValidate
        ),
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
