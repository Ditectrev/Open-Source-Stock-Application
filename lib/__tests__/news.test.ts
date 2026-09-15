import { describe, expect, it } from "vitest";
import {
  buildNewsArticle,
  displayNameForSymbol,
  extractMentionedSymbols,
  formatNewsDate,
  isRedundantNewsSummary,
  newsArticlePath,
  newsDeskCopy,
  newsHubPath,
  newsLinkSegments,
  newsSlugFromId,
  slugifyNewsHeadline,
  uniquifyNewsSlug,
  normalizeRelatedTickers,
  paginateNewsArticles,
  parseNewsPage,
  pickRelatedNewsArticles,
  symbolQuotePath,
  toIsoFromUnixSeconds,
} from "@/lib/news";

describe("news helpers", () => {
  it("builds quote and article paths", () => {
    expect(symbolQuotePath("MCD")).toBe("/?symbol=MCD");
    expect(newsArticlePath("mcdonalds-same-store-sales-rise")).toBe(
      "/news/mcdonalds-same-store-sales-rise"
    );
  });

  it("builds stable slugs from provider ids", () => {
    expect(newsSlugFromId("yh", "A1B2-C3")).toBe("yh-a1b2-c3");
    expect(newsSlugFromId("fh", "918273")).toBe("fh-918273");
  });

  it("builds SEO slugs from headlines", () => {
    expect(
      slugifyNewsHeadline(
        "AirBaltic files for Chapter 11 bankruptcy as Iran war costs bite - Reuters"
      )
    ).toBe("airbaltic-files-for-chapter-11-bankruptcy-as-iran-war-costs-bite");
    expect(slugifyNewsHeadline("McDonald's same-store sales rise")).toBe(
      "mcdonalds-same-store-sales-rise"
    );
    const used = new Set(["oil-prices-rise"]);
    expect(uniquifyNewsSlug("oil-prices-rise", used, "8488028")).toBe(
      "oil-prices-rise-8488028"
    );
  });

  it("normalizes Finnhub and Yahoo related ticker fields", () => {
    expect(normalizeRelatedTickers("AAPL, MSFT")).toEqual(["AAPL", "MSFT"]);
    expect(normalizeRelatedTickers(["NASDAQ:MCD", "^GSPC", "SBUX"])).toEqual([
      "MCD",
      "SBUX",
    ]);
    expect(normalizeRelatedTickers("CEO, ETF")).toEqual([]);
  });

  it("extracts McDonald's and other mentioned stocks from copy plus related tickers", () => {
    const text =
      "McDonald's raised prices in the US while $SBUX and peers watched (NKE).";
    expect(extractMentionedSymbols(text, ["MCD"])).toEqual([
      "MCD",
      "NKE",
      "SBUX",
    ]);
  });

  it("splits article text so mentioned names become quote links", () => {
    const segments = newsLinkSegments(
      "McDonald's (MCD) beat estimates as Starbucks lagged.",
      ["MCD", "SBUX"]
    );
    const links = segments.filter((segment) => segment.type === "link");
    expect(links.map((segment) => segment.symbol)).toEqual([
      "MCD",
      "MCD",
      "SBUX",
    ]);
    expect(links[0]?.text).toMatch(/McDonald/i);
  });

  it("formats dates in UTC and converts unix seconds", () => {
    expect(formatNewsDate("2024-01-15T12:00:00.000Z")).toBe("Jan 15, 2024");
    expect(toIsoFromUnixSeconds(1_705_320_000)).toBe(
      "2024-01-15T12:00:00.000Z"
    );
  });

  it("returns a display name for known tickers", () => {
    expect(displayNameForSymbol("MCD")).toMatch(/McDonald/);
    expect(displayNameForSymbol("ZZZZ")).toBeNull();
  });
});

describe("buildNewsArticle", () => {
  it("drops items without a public source URL and keeps mentioned tickers", () => {
    expect(
      buildNewsArticle({
        sourcePrefix: "fh",
        id: "1",
        title: "Skip",
        source: "Wire",
        sourceUrl: "/relative",
        publishedAt: "2024-01-15T12:00:00.000Z",
      })
    ).toBeNull();

    const article = buildNewsArticle({
      sourcePrefix: "yh",
      id: "abc",
      title: "McDonald's same-store sales rise",
      summary: "The burger chain beat estimates.",
      source: "Reuters",
      sourceUrl: "https://example.com/mcd",
      publishedAt: "2024-01-15T12:00:00.000Z",
      related: ["MCD"],
    });
    expect(article?.slug).toBe("mcdonalds-same-store-sales-rise");
    expect(article?.mentionedSymbols).toContain("MCD");
  });
});

describe("newsDeskCopy", () => {
  it("writes original research copy naming mentioned tickers", () => {
    const article = buildNewsArticle({
      sourcePrefix: "yh",
      id: "abc",
      title: "McDonald's same-store sales rise",
      summary: "The burger chain beat estimates.",
      source: "Reuters",
      sourceUrl: "https://example.com/mcd",
      publishedAt: "2024-01-15T12:00:00.000Z",
      related: ["MCD"],
    });
    expect(article).not.toBeNull();
    const copy = newsDeskCopy(article!, "The Open Stock");
    expect(copy.join(" ")).toMatch(/not the publisher/i);
    expect(copy.join(" ")).toMatch(/MCD/);
    expect(copy.join(" ")).not.toBe(article!.summary);
  });
});

describe("isRedundantNewsSummary", () => {
  it("treats Finnhub headline reprints as empty blurbs", () => {
    expect(
      isRedundantNewsSummary(
        "Houthi advance in Yemen puts U.S. in a new bind - Reuters",
        "Houthi advance in Yemen puts U.S. in a new bind  Reuters"
      )
    ).toBe(true);
    expect(
      isRedundantNewsSummary(
        "McDonald's same-store sales rise",
        "The burger chain beat estimates."
      )
    ).toBe(false);
  });
});

describe("pickRelatedNewsArticles", () => {
  it("prefers stories that share mentioned tickers", () => {
    const article = {
      id: "a",
      slug: "yh-a",
      title: "McDonald's sales",
      summary: "",
      source: "Reuters",
      sourceUrl: "https://example.com/a",
      publishedAt: "2024-01-15T12:00:00.000Z",
      mentionedSymbols: ["MCD"],
    };
    const overlapping = {
      ...article,
      id: "b",
      slug: "yh-b",
      title: "McDonald's menu",
    };
    const other = {
      ...article,
      id: "c",
      slug: "yh-c",
      title: "Oil jumps",
      mentionedSymbols: ["XOM"],
    };
    expect(
      pickRelatedNewsArticles(article, [article, other, overlapping], 1).map(
        (item) => item.slug
      )
    ).toEqual(["yh-b"]);
  });
});

describe("news hub pagination", () => {
  it("parses pages and slices the feed", () => {
    expect(parseNewsPage("2")).toBe(2);
    expect(parseNewsPage("0")).toBe(1);
    expect(newsHubPath(null, 1)).toBe("/news");
    expect(newsHubPath("MCD", 2)).toBe("/news?symbol=MCD&page=2");
    const items = Array.from({ length: 12 }, (_, index) => index);
    const first = paginateNewsArticles(items, 1);
    expect(first.items).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(first.totalPages).toBe(2);
    expect(paginateNewsArticles(items, 2).items).toEqual([10, 11]);
    expect(paginateNewsArticles(items, 99).page).toBe(2);
  });
});
