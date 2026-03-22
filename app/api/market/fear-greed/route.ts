/**
 * GET /api/market/fear-greed
 * Returns Fear and Greed Index
 */

import { NextRequest, NextResponse } from "next/server";
import { marketDataService } from "@/services/market-data.service";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "30", 10);
    const clampedLimit = Math.max(1, Math.min(365, limit));
    const data = await marketDataService.getFearGreedIndex(clampedLimit);

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to fetch Fear & Greed Index", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch Fear & Greed Index",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
