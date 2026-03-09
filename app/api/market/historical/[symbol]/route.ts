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
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
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
    const { symbol } = await params;
    const searchParams = request.nextUrl.searchParams;
    const range = (searchParams.get("range") || "1Y") as TimeRange;
    
    logger.error("Failed to fetch historical data", error as Error, {
      symbol,
    });

    // Fallback to mock data for development/testing
    const getDaysForRange = (range: TimeRange): number => {
      switch (range) {
        case "1D": return 1;
        case "1W": return 7;
        case "1M": return 30;
        case "3M": return 90;
        case "1Y": return 365;
        case "5Y": return 1825;
        case "Max": return 3650;
        default: return 365;
      }
    };

    const days = getDaysForRange(range);
    const mockData = [];
    const endDate = new Date();
    let price = 150;

    for (let i = days; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      
      const change = (Math.random() - 0.5) * 5;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      const volume = Math.floor(Math.random() * 10000000) + 1000000;
      
      mockData.push({
        timestamp: date,
        open,
        high,
        low,
        close,
        volume,
      });
      
      price = close;
    }

    logger.warn("Using mock historical data fallback due to API failure", { symbol, range });

    return NextResponse.json({
      success: true,
      data: mockData,
      isMockData: true,
      timestamp: new Date(),
    });
  }
}
