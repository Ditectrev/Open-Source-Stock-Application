/**
 * GET /api/calendar/dividends
 * Returns dividend calendar events
 * Query params: country (string), timezone (string)
 */

import { NextResponse } from "next/server";
import { marketDataService } from "@/services/market-data.service";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const data = await marketDataService.getDividendEvents();

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error(
      "Failed to fetch dividend events",
      error as Error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dividend events",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
