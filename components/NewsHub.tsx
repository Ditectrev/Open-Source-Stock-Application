import Link from "next/link";
import {
  DNA_BODY,
  DNA_BUTTON_SECONDARY,
  DNA_CAPTION,
  DNA_DISPLAY,
  DNA_EYEBROW,
  DNA_HEADING,
  DNA_HERO_LEAD,
  DNA_INSTRUMENT_PANEL,
  DNA_MARKETING_STACK,
  DNA_SECTION_RULE,
} from "@/lib/design-dna";
import {
  formatNewsDate,
  newsArticlePath,
  newsHubPath,
  type NewsArticle,
} from "@/lib/news";
import { SITE_NAME } from "@/lib/site-seo";

export function NewsHub({
  articles,
  symbolFilter = null,
  page = 1,
  totalPages = 1,
}: {
  articles: NewsArticle[];
  symbolFilter?: string | null;
  page?: number;
  totalPages?: number;
}) {
  return (
    <div className={DNA_MARKETING_STACK} data-testid="news-hub">
      <header className={DNA_SECTION_RULE}>
        <p className={DNA_EYEBROW}>
          {symbolFilter ? `${symbolFilter} · News` : "Markets · News"}
        </p>
        <h1 className={`mt-3 ${DNA_DISPLAY}`}>
          {symbolFilter ? `${symbolFilter} stock news` : "Stock market news"}
        </h1>
        <p className={`mt-4 max-w-3xl ${DNA_HERO_LEAD}`}>
          Headlines for DIY investors. Open a story for the publisher excerpt,
          mentioned tickers, and charts on {SITE_NAME} — the full wire article
          stays at the source.
        </p>
        <p className={`mt-3 ${DNA_CAPTION}`}>
          {symbolFilter ? (
            <>
              <Link href="/news" className="underline underline-offset-2">
                All market news
              </Link>
              {" · "}
            </>
          ) : null}
          <a href="/news/rss.xml" className="underline underline-offset-2">
            RSS
          </a>
        </p>
      </header>

      {articles.length === 0 ? (
        <p className={DNA_BODY}>
          No market news right now. Check back shortly.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {articles.map((article) => (
            <li key={article.slug} className={DNA_INSTRUMENT_PANEL}>
              <p className={DNA_CAPTION}>
                {article.source}
                {article.publishedAt
                  ? ` · ${formatNewsDate(article.publishedAt)}`
                  : ""}
              </p>
              <h2 className={`mt-2 ${DNA_HEADING}`}>
                <Link
                  href={newsArticlePath(article.slug)}
                  className="hover:underline"
                >
                  {article.title}
                </Link>
              </h2>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav
          className="flex items-center justify-between gap-3"
          aria-label="News pages"
        >
          {page > 1 ? (
            <Link
              href={newsHubPath(symbolFilter, page - 1)}
              className={DNA_BUTTON_SECONDARY}
            >
              Previous
            </Link>
          ) : (
            <span
              className={`${DNA_BUTTON_SECONDARY} pointer-events-none opacity-50`}
              aria-disabled="true"
            >
              Previous
            </span>
          )}
          <p className={DNA_CAPTION}>
            Page {page} of {totalPages}
          </p>
          {page < totalPages ? (
            <Link
              href={newsHubPath(symbolFilter, page + 1)}
              className={DNA_BUTTON_SECONDARY}
            >
              Next
            </Link>
          ) : (
            <span
              className={`${DNA_BUTTON_SECONDARY} pointer-events-none opacity-50`}
              aria-disabled="true"
            >
              Next
            </span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
