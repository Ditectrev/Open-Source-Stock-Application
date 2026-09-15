/**
 * GET /api/market/news/[slug]
 */

import { NextRequest, NextResponse } from "next/server";
import { MARKET_UI_COPY, userFacingApiError } from "@/lib/api-user-error";
import { logger } from "@/lib/logger";
import { marketDataService } from "@/services/market-data.service";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const article = await marketDataService.getNewsArticle(slug);
    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: "Article not found",
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: article,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to fetch news article", error as Error);
    return NextResponse.json(
      {
        success: false,
        error: userFacingApiError(error, MARKET_UI_COPY.load.newsArticle),
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
