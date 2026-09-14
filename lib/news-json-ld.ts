import type { Metadata } from "next";
import {
  displayNameForSymbol,
  newsArticlePath,
  newsHubPath,
  type NewsArticle,
} from "@/lib/news";
import { SITE_NAME, buildPageMetadata, getSiteUrl } from "@/lib/site-seo";
import { NEWS_RSS_PATH } from "@/lib/news-rss";

const META_DESCRIPTION_MAX = 158;
const HUB_ITEM_LIST_LIMIT = 20;

export const NEWS_HUB_SEO = {
  title: "Stock Market News",
  description:
    "Latest stock market news with mentioned tickers linked to free charts on The Open Stock. Open McDonald's as MCD, Apple as AAPL, and more.",
  path: "/news",
  keywords: [
    "stock news",
    "market news",
    "mentioned stocks",
    "stock headlines",
  ],
} as const;

export function newsMetaDescription(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= META_DESCRIPTION_MAX) return trimmed;
  const truncated = trimmed.slice(0, META_DESCRIPTION_MAX);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0 ? `${truncated.slice(0, lastSpace)}…` : `${truncated}…`;
}

export function buildNewsHubMetadata(
  symbol?: string | null,
  page = 1
): Metadata {
  const path = newsHubPath(symbol, page);
  const pageLabel = page > 1 ? ` · Page ${page}` : "";
  const rssUrl = `${getSiteUrl()}${NEWS_RSS_PATH}`;
  const base = !symbol
    ? buildPageMetadata({
        ...NEWS_HUB_SEO,
        title: `${NEWS_HUB_SEO.title}${pageLabel}`,
        path,
      })
    : buildPageMetadata({
        title: `${symbol} stock news${pageLabel}`,
        description: newsMetaDescription(
          `Latest ${symbol} stock news with mentioned tickers linked to free charts on ${SITE_NAME}.`
        ),
        path,
        keywords: [
          `${symbol} stock news`,
          `${symbol} news`,
          "stock news",
          "mentioned stocks",
        ],
      });

  return {
    ...base,
    robots: page > 1 ? { index: false, follow: true } : base.robots,
    alternates: {
      ...base.alternates,
      types: {
        "application/rss+xml": rssUrl,
      },
    },
  };
}

export function newsArticleSearchDescription(article: NewsArticle): string {
  const research =
    article.mentionedSymbols.length > 0
      ? ` Research ${article.mentionedSymbols.join(", ")} on ${SITE_NAME}.`
      : ` Open this ${article.source} headline on ${SITE_NAME}, then read the full story at the publisher.`;
  const blurb = article.summary ? ` ${article.summary}` : "";
  return newsMetaDescription(`${article.title}.${research}${blurb}`);
}

export function buildNewsArticleMetadata(article: NewsArticle): Metadata {
  const description = newsArticleSearchDescription(article);
  const path = newsArticlePath(article.slug);
  const base = buildPageMetadata({
    title: article.title,
    description,
    path,
    keywords: [
      "stock news",
      article.source,
      ...article.mentionedSymbols.map((symbol) => `${symbol} stock`),
    ],
  });

  return {
    ...base,
    authors: [{ name: article.source, url: article.sourceUrl }],
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.publishedAt,
      authors: [article.source],
    },
  };
}

export function buildMissingNewsArticleMetadata(slug: string): Metadata {
  return buildPageMetadata({
    title: "News story unavailable",
    description:
      "That headline is no longer in the live market news feed. See the latest stories on The Open Stock news hub.",
    path: newsArticlePath(slug),
    noIndex: true,
  });
}

export function buildNewsHubJsonLd(
  articles: NewsArticle[] = [],
  hubPath = "/news"
) {
  const siteUrl = getSiteUrl();
  const hubUrl = `${siteUrl}/news`;
  const newsUrl = `${siteUrl}${hubPath}`;
  const list = articles.slice(0, HUB_ITEM_LIST_LIMIT);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${newsUrl}#page`,
        url: newsUrl,
        name: `${SITE_NAME} stock market news`,
        description: `Stock market headlines with mentioned tickers linked to free quote pages. Aggregated from newswires; ${SITE_NAME} is not the publisher.`,
        isPartOf: { "@id": `${siteUrl}/#website` },
        mainEntity: { "@id": `${newsUrl}#list` },
      },
      {
        "@type": "ItemList",
        "@id": `${newsUrl}#list`,
        name: `${SITE_NAME} market headlines`,
        numberOfItems: list.length,
        itemListElement: list.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: article.title,
          url: `${siteUrl}${newsArticlePath(article.slug)}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "News",
            item: hubUrl,
          },
        ],
      },
    ],
  };
}

export function buildNewsArticleJsonLd(article: NewsArticle) {
  const siteUrl = getSiteUrl();
  const newsUrl = `${siteUrl}/news`;
  const pageUrl = `${siteUrl}${newsArticlePath(article.slug)}`;
  const publisher = {
    "@type": "Organization" as const,
    name: article.source,
    url: article.sourceUrl,
  };
  const about = article.mentionedSymbols.map((symbol) => ({
    "@type": "Corporation" as const,
    name: displayNameForSymbol(symbol) || symbol,
    tickerSymbol: symbol,
    url: `${siteUrl}/?symbol=${encodeURIComponent(symbol)}`,
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: article.title,
        description: newsArticleSearchDescription(article),
        isPartOf: { "@id": `${siteUrl}/#website` },
        mainEntity: { "@id": `${pageUrl}#article` },
      },
      {
        "@type": "NewsArticle",
        "@id": `${pageUrl}#article`,
        headline: article.title,
        description:
          article.summary ||
          `Headline via ${article.source}. ${SITE_NAME} is not the publisher.`,
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        isBasedOn: article.sourceUrl,
        inLanguage: "en-US",
        isAccessibleForFree: true,
        creditText: `Headline via ${article.source}. ${SITE_NAME} is not the publisher.`,
        copyrightHolder: publisher,
        author: publisher,
        publisher,
        ...(about.length > 0 ? { about, mentions: about } : {}),
        isPartOf: { "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "News",
            item: newsUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
