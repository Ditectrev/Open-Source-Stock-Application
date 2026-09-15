import { newsArticlePath, type NewsArticle } from "@/lib/news";
import { SITE_NAME, getSiteUrl } from "@/lib/site-seo";

export const NEWS_RSS_PATH = "/news/rss.xml";
const RSS_ITEM_LIMIT = 20;

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildNewsRssXml(articles: NewsArticle[]): string {
  const siteUrl = getSiteUrl();
  const feedUrl = `${siteUrl}${NEWS_RSS_PATH}`;
  const items = articles.slice(0, RSS_ITEM_LIMIT).map((article) => {
    const link = `${siteUrl}${newsArticlePath(article.slug)}`;
    const description = [
      article.summary,
      article.mentionedSymbols.length > 0
        ? `Mentioned tickers on ${SITE_NAME}: ${article.mentionedSymbols.join(", ")}.`
        : `${SITE_NAME} is not the publisher. Full story at ${article.source}.`,
    ]
      .filter(Boolean)
      .join(" ");
    return [
      "<item>",
      `<title>${xmlEscape(article.title)}</title>`,
      `<link>${xmlEscape(link)}</link>`,
      `<guid isPermaLink="true">${xmlEscape(link)}</guid>`,
      `<pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>`,
      `<author>${xmlEscape(article.source)}</author>`,
      `<description>${xmlEscape(description)}</description>`,
      "</item>",
    ].join("");
  });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    "<channel>",
    `<title>${xmlEscape(`${SITE_NAME} stock market news`)}</title>`,
    `<link>${xmlEscape(`${siteUrl}/news`)}</link>`,
    `<description>${xmlEscape(
      `Live market headlines with mentioned tickers linked to free charts on ${SITE_NAME}. Aggregated from newswires; we are not the publisher.`
    )}</description>`,
    `<language>en-us</language>`,
    `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    "<ttl>5</ttl>",
    `<atom:link href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml"/>`,
    ...items,
    "</channel>",
    "</rss>",
  ].join("");
}
