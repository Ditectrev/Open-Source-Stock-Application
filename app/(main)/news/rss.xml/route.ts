/**
 * GET /news/rss.xml — live headline feed for crawlers and assistants.
 */

import { logger } from "@/lib/logger";
import type { NewsArticle } from "@/lib/news";
import { buildNewsRssXml } from "@/lib/news-rss";
import { marketDataService } from "@/services/market-data.service";

export const revalidate = 300;

export async function GET() {
  let articles: NewsArticle[] = [];
  try {
    articles = await marketDataService.getMarketNews();
  } catch (error) {
    logger.error("Failed to build news RSS", error as Error);
  }

  return new Response(buildNewsRssXml(articles), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
