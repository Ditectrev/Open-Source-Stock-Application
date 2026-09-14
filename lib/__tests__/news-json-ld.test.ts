import { describe, expect, it } from "vitest";
import {
  buildMissingNewsArticleMetadata,
  buildNewsArticleJsonLd,
  buildNewsArticleMetadata,
  buildNewsHubJsonLd,
  buildNewsHubMetadata,
  newsMetaDescription,
} from "@/lib/news-json-ld";
import type { NewsArticle } from "@/lib/news";

const ARTICLE: NewsArticle = {
  id: "abc",
  slug: "yh-abc",
  title: "McDonald's same-store sales rise",
  summary: "The burger chain beat estimates.",
  source: "Reuters",
  sourceUrl: "https://example.com/mcd-story",
  publishedAt: "2024-01-15T12:00:00.000Z",
  mentionedSymbols: ["MCD"],
};

describe("news SEO helpers", () => {
  it("truncates meta descriptions on a word boundary", () => {
    const long = "word ".repeat(50).trim();
    const description = newsMetaDescription(long);
    expect(description.endsWith("…")).toBe(true);
    expect(description.length).toBeLessThanOrEqual(159);
  });

  it("builds hub metadata and ItemList JSON-LD from live headlines", () => {
    const metadata = buildNewsHubMetadata();
    expect(metadata.alternates?.canonical).toMatch(/\/news$/);
    expect(metadata.robots).toEqual({ index: true, follow: true });

    const filtered = buildNewsHubMetadata("MCD");
    expect(filtered.title).toBe("MCD stock news");
    expect(String(filtered.alternates?.canonical)).toContain("symbol=MCD");

    const paged = buildNewsHubMetadata(null, 2);
    expect(paged.title).toBe("Stock Market News · Page 2");
    expect(String(paged.alternates?.canonical)).toContain("page=2");
    expect(paged.robots).toEqual({ index: false, follow: true });
    expect(paged.alternates?.types?.["application/rss+xml"]).toMatch(
      /\/news\/rss\.xml$/
    );

    const jsonLd = buildNewsHubJsonLd([ARTICLE]);
    const types = jsonLd["@graph"].map((node) => node["@type"]);
    expect(types).toContain("CollectionPage");
    expect(types).toContain("ItemList");
    const collection = jsonLd["@graph"].find(
      (node) => node["@type"] === "CollectionPage"
    ) as { mainEntity: { "@id": string }; description: string };
    expect(collection.mainEntity["@id"]).toMatch(/#list$/);
    expect(collection.description).toMatch(/not the publisher/);
    const list = jsonLd["@graph"].find(
      (node) => node["@type"] === "ItemList"
    ) as {
      itemListElement: Array<{ url: string; name: string }>;
    };
    expect(list.itemListElement[0]?.url).toContain("/news/yh-abc");
    expect(list.itemListElement[0]?.name).toBe(ARTICLE.title);
  });

  it("builds NewsArticle JSON-LD that credits the wire publisher", () => {
    const jsonLd = buildNewsArticleJsonLd(ARTICLE);
    const types = jsonLd["@graph"].map((node) => node["@type"]);
    expect(types).toContain("WebPage");
    expect(types).toContain("NewsArticle");
    const article = jsonLd["@graph"].find(
      (node) => node["@type"] === "NewsArticle"
    ) as {
      headline: string;
      isBasedOn: string;
      publisher: { name: string };
      about: Array<{ tickerSymbol: string }>;
      image?: string;
      isAccessibleForFree: boolean;
      creditText: string;
      dateModified: string;
      copyrightHolder: { name: string };
      mentions: Array<{ tickerSymbol: string }>;
    };
    expect(article.headline).toBe(ARTICLE.title);
    expect(article.isBasedOn).toBe(ARTICLE.sourceUrl);
    expect(article.publisher.name).toBe("Reuters");
    expect(article.about[0]?.tickerSymbol).toBe("MCD");
    expect(article.mentions[0]?.tickerSymbol).toBe("MCD");
    expect(article.image).toBeUndefined();
    expect(article.isAccessibleForFree).toBe(true);
    expect(article.dateModified).toBe(ARTICLE.publishedAt);
    expect(article.copyrightHolder.name).toBe("Reuters");
    expect(article.creditText).toMatch(/not the publisher/);

    const metadata = buildNewsArticleMetadata(ARTICLE);
    expect(metadata.openGraph?.type).toBe("article");
    expect(metadata.authors).toEqual([
      { name: "Reuters", url: ARTICLE.sourceUrl },
    ]);
    expect(metadata.alternates?.canonical).toContain("/news/yh-abc");
    expect(metadata.alternates?.types?.["application/rss+xml"]).toMatch(
      /\/news\/rss\.xml$/
    );
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(String(metadata.description)).toMatch(/MCD/);
    expect(String(metadata.description)).toMatch(/The Open Stock/);
  });

  it("noindexes stories that have left the live feed", () => {
    const metadata = buildMissingNewsArticleMetadata("yh-gone");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toContain("/news/yh-gone");
  });
});
