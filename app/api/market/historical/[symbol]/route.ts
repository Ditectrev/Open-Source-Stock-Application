/**
 * GET /api/market/historical/[symbol]?range=1Y
 * Returns historical price data
 */

import { NextRequest, NextResponse } from "next/server";
import { marketDataService } from "@/services/market-data.service";
import { logger } from "@/lib/logger";
import { TimeRange } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol;
    const searchParams = request.nextUrl.searchParams;
    const range = (searchParams.get("range") || "1Y") as TimeRange;

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: "Symbol parameter is required" },
        { status: 400 }
      );
    }

    const data = await marketDataService.getHistoricalPrices(symbol, range);

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to fetch historical data", error as Error, {
      symbol: params.symbol,
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch historical data",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
