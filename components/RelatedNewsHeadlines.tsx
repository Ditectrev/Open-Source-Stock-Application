import Link from "next/link";
import { DNA_CAPTION, DNA_HEADING, DNA_SUBHEADING } from "@/lib/design-dna";
import {
  formatNewsDate,
  newsArticlePath,
  pickRelatedNewsArticles,
  type NewsArticle,
} from "@/lib/news";
import { logger } from "@/lib/logger";
import { marketDataService } from "@/services/market-data.service";

export function RelatedNewsList({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <section data-testid="related-news">
      <h2 className={DNA_HEADING}>More market headlines</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {articles.map((related) => (
          <li key={related.slug}>
            <Link
              href={newsArticlePath(related.slug)}
              className="block hover:underline"
            >
              <span className={DNA_SUBHEADING}>{related.title}</span>
            </Link>
            <p className={`mt-1 ${DNA_CAPTION}`}>
              {related.source}
              {related.publishedAt
                ? ` · ${formatNewsDate(related.publishedAt)}`
                : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function RelatedNewsSection({
  slug,
  mentionedSymbols,
}: {
  slug: string;
  mentionedSymbols: string[];
}) {
  let feed: NewsArticle[] = [];
  try {
    feed = await marketDataService.getMarketNews();
  } catch (error) {
    logger.warn("Failed to load related news headlines", {
      error: (error as Error).message,
    });
    return null;
  }

  return (
    <RelatedNewsList
      articles={pickRelatedNewsArticles({ slug, mentionedSymbols }, feed)}
    />
  );
}
