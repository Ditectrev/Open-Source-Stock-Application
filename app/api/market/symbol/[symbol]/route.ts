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

    // Fallback to mock data for development/testing when API fails
    const mockData = {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Inc.`,
      price: 150.25 + Math.random() * 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      marketCap: 2500000000000 + Math.random() * 1000000000000,
      volume: 50000000 + Math.random() * 20000000,
      fiftyTwoWeekHigh: 180.5 + Math.random() * 20,
      fiftyTwoWeekLow: 120.3 + Math.random() * 10,
      lastUpdated: new Date(),
    };

    logger.warn("Using mock data fallback due to API failure", { symbol });

    return NextResponse.json({
      success: true,
      data: mockData,
      isMockData: true,
      timestamp: new Date(),
    });
  }
}
