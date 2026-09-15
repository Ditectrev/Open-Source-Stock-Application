import type { ReactNode } from "react";
import Link from "next/link";
import { MentionedStocks } from "@/components/MentionedStocks";
import { NewsLinkedText } from "@/components/NewsLinkedText";
import {
  DNA_BODY,
  DNA_BODY_SECONDARY,
  DNA_BUTTON_PRIMARY,
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
  isRedundantNewsSummary,
  newsDeskCopy,
  type NewsArticle,
} from "@/lib/news";
import { SITE_NAME } from "@/lib/site-seo";

export function NewsArticleView({
  article,
  children,
}: {
  article: NewsArticle;
  children?: ReactNode;
}) {
  const deskCopy = newsDeskCopy(article, SITE_NAME);

  return (
    <article className={DNA_MARKETING_STACK} data-testid="news-article">
      <header className={DNA_SECTION_RULE}>
        <p className={DNA_EYEBROW}>
          <Link href="/news" className="hover:underline">
            News
          </Link>
          {` · ${article.source}`}
          {article.publishedAt
            ? ` · ${formatNewsDate(article.publishedAt)}`
            : ""}
        </p>
        <h1 className={`mt-3 ${DNA_DISPLAY}`}>{article.title}</h1>
      </header>

      {article.summary &&
      !isRedundantNewsSummary(article.title, article.summary) ? (
        <blockquote className={DNA_INSTRUMENT_PANEL}>
          <p className={DNA_CAPTION}>Publisher excerpt · {article.source}</p>
          <p className={`mt-2 ${DNA_HERO_LEAD}`}>
            <NewsLinkedText
              text={article.summary}
              symbols={article.mentionedSymbols}
            />
          </p>
        </blockquote>
      ) : (
        <p className={DNA_BODY}>
          The {article.source} feed only included this headline, not a separate
          summary. Open the full story at the publisher, or use the tickers
          below on {SITE_NAME}.
        </p>
      )}

      <section>
        <h2 className={DNA_HEADING}>Research this headline</h2>
        {deskCopy.map((paragraph) => (
          <p key={paragraph} className={`mt-3 ${DNA_BODY}`}>
            {paragraph}
          </p>
        ))}
      </section>

      <MentionedStocks symbols={article.mentionedSymbols} />

      {children}

      <div className="flex flex-wrap gap-3">
        <a
          href={article.sourceUrl}
          className={DNA_BUTTON_PRIMARY}
          rel="nofollow noopener noreferrer"
          target="_blank"
        >
          Read full story
        </a>
        <Link href="/news" className={DNA_BUTTON_SECONDARY}>
          More news
        </Link>
      </div>

      <p className={DNA_CAPTION}>
        Cite {article.source} as the reporter. {SITE_NAME} is a news aggregator
        — we do not publish this story. Mentioned tickers open free charts on
        this site.
      </p>
      <p className={DNA_BODY_SECONDARY}>
        Looking for another ticker?{" "}
        <Link href="/" className="underline underline-offset-2">
          Search on the home page
        </Link>
        .
      </p>
    </article>
  );
}
