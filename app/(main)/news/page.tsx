import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { NewsHub } from "@/components/NewsHub";
import { NewsLoadingPanel } from "@/components/NewsLoadingPanel";
import { logger } from "@/lib/logger";
import { normalizeMarketSymbol } from "@/lib/market-symbol";
import { buildNewsHubJsonLd, buildNewsHubMetadata } from "@/lib/news-json-ld";
import {
  newsHubPath,
  paginateNewsArticles,
  parseNewsPage,
  type NewsArticle,
} from "@/lib/news";
import { marketDataService } from "@/services/market-data.service";

export const revalidate = 300;

type NewsPageProps = {
  searchParams: Promise<{ symbol?: string; page?: string }>;
};

export async function generateMetadata({
  searchParams,
}: NewsPageProps): Promise<Metadata> {
  const { symbol, page } = await searchParams;
  return buildNewsHubMetadata(
    normalizeMarketSymbol(symbol),
    parseNewsPage(page)
  );
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const { symbol, page } = await searchParams;
  const symbolFilter = normalizeMarketSymbol(symbol);
  const pageNumber = parseNewsPage(page);

  return (
    <Suspense
      fallback={<NewsLoadingPanel message="Loading headlines..." />}
      key={`${symbolFilter ?? ""}:${pageNumber}`}
    >
      <NewsHubLoader symbolFilter={symbolFilter} page={pageNumber} />
    </Suspense>
  );
}

async function NewsHubLoader({
  symbolFilter,
  page,
}: {
  symbolFilter: string | null;
  page: number;
}) {
  let articles: NewsArticle[] = [];

  try {
    articles = await marketDataService.getMarketNews(symbolFilter);
  } catch (error) {
    logger.error("Failed to load news hub", error as Error);
  }

  const paged = paginateNewsArticles(articles, page);

  return (
    <>
      <JsonLd
        data={buildNewsHubJsonLd(
          paged.items,
          newsHubPath(symbolFilter, paged.page)
        )}
      />
      <NewsHub
        articles={paged.items}
        symbolFilter={symbolFilter}
        page={paged.page}
        totalPages={paged.totalPages}
      />
    </>
  );
}
