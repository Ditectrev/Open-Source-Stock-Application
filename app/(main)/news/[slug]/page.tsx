import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { NewsArticleView } from "@/components/NewsArticleView";
import { NewsLoadingPanel } from "@/components/NewsLoadingPanel";
import { RelatedNewsSection } from "@/components/RelatedNewsHeadlines";
import {
  buildMissingNewsArticleMetadata,
  buildNewsArticleJsonLd,
  buildNewsArticleMetadata,
} from "@/lib/news-json-ld";
import { newsArticlePath } from "@/lib/news";
import { marketDataService } from "@/services/market-data.service";

export const revalidate = 300;

type NewsArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await marketDataService.getNewsArticle(slug);
  if (!article) {
    return buildMissingNewsArticleMetadata(slug);
  }
  return buildNewsArticleMetadata(article);
}

export default function NewsArticlePage({ params }: NewsArticlePageProps) {
  return (
    <Suspense fallback={<NewsLoadingPanel message="Loading story..." />}>
      <NewsArticleLoader params={params} />
    </Suspense>
  );
}

async function NewsArticleLoader({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const article = await marketDataService.getNewsArticle(slug);
  if (!article) {
    notFound();
  }

  const requested = decodeURIComponent(slug).trim().toLowerCase();
  if (article.slug !== requested) {
    permanentRedirect(newsArticlePath(article.slug));
  }

  return (
    <>
      <JsonLd data={buildNewsArticleJsonLd(article)} />
      <NewsArticleView article={article}>
        <Suspense fallback={null}>
          <RelatedNewsSection
            slug={article.slug}
            mentionedSymbols={article.mentionedSymbols}
          />
        </Suspense>
      </NewsArticleView>
    </>
  );
}
