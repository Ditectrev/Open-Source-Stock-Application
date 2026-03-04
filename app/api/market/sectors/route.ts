/**
 * GET /api/market/sectors
 * Returns sector performance data
 */

import { NextRequest, NextResponse } from "next/server";
import { marketDataService } from "@/services/market-data.service";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const data = await marketDataService.getSectorPerformance();

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to fetch sector performance", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch sector performance",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
