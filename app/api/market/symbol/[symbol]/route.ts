/**
 * GET /api/market/symbol/[symbol]
 * Returns current data for a specific symbol
 */

import { NextRequest, NextResponse } from "next/server";
import { marketDataService } from "@/services/market-data.service";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: "Symbol parameter is required" },
        { status: 400 }
      );
    }

    const data = await marketDataService.getSymbolData(symbol);

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    const { symbol } = await params;
    logger.error("Failed to fetch symbol data", error as Error, {
      symbol,
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch symbol data",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
