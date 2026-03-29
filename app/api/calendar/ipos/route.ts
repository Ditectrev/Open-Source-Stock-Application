/**
 * GET /api/calendar/ipos
 * Returns IPO calendar events
 * Query params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
 */

import { NextRequest, NextResponse } from "next/server";
import { marketDataService } from "@/services/market-data.service";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const data = await marketDataService.getIPOEvents(startDate, endDate);

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to fetch IPO events", error as Error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch IPO events",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
