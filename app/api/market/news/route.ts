/**
 * GET /api/market/news
 * Optional ?symbol=MCD for company news.
 */

import { NextRequest, NextResponse } from "next/server";
import { MARKET_UI_COPY, userFacingApiError } from "@/lib/api-user-error";
import { normalizeMarketSymbol } from "@/lib/market-symbol";
import { logger } from "@/lib/logger";
import { marketDataService } from "@/services/market-data.service";

export async function GET(request: NextRequest) {
  try {
    const rawSymbol = request.nextUrl.searchParams.get("symbol");
    const symbol = rawSymbol ? normalizeMarketSymbol(rawSymbol) : null;
    if (rawSymbol && rawSymbol.trim() && !symbol) {
      return NextResponse.json(
        { success: false, error: "Invalid symbol" },
        { status: 400 }
      );
    }

    const data = await marketDataService.getMarketNews(symbol);
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to fetch market news", error as Error);
    return NextResponse.json(
      {
        success: false,
        error: userFacingApiError(error, MARKET_UI_COPY.load.marketNews),
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
