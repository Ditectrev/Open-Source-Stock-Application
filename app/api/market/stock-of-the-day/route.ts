import { NextResponse } from "next/server";
import { aiMarketInsightsService } from "@/services/ai-market-insights.service";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const data = await aiMarketInsightsService.getStockOfTheDay();

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to load stock of the day", error as Error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load stock of the day",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
