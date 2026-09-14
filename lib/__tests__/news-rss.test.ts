import { describe, expect, it } from "vitest";
import { buildNewsRssXml, xmlEscape } from "@/lib/news-rss";
import type { NewsArticle } from "@/lib/news";

const ARTICLE: NewsArticle = {
  id: "abc",
  slug: "mcdonalds-same-store-sales-rise",
  title: "McDonald's same-store sales rise",
  summary: "The burger chain beat estimates.",
  source: "Reuters",
  sourceUrl: "https://example.com/mcd-story",
  publishedAt: "2024-01-15T12:00:00.000Z",
  mentionedSymbols: ["MCD"],
};

describe("news RSS", () => {
  it("escapes XML and lists headline permalinks", () => {
    expect(xmlEscape(`A & B <C>`)).toBe("A &amp; B &lt;C&gt;");
    const xml = buildNewsRssXml([ARTICLE]);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<ttl>5</ttl>");
    expect(xml).toContain("<lastBuildDate>");
    expect(xml).toContain("/news/mcdonalds-same-store-sales-rise");
    expect(xml).toContain("Mentioned tickers");
    expect(xml).toContain("MCD");
    expect(xml).not.toContain("https://example.com/mcd-story");
  });
});
