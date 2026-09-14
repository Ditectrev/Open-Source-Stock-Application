import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  getSiteUrl,
  buildPageMetadata,
  buildWebSiteJsonLd,
  SITE_NAME,
} from "@/lib/site-seo";

describe("site-seo", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("getSiteUrl prefers NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://theopenstock.com";
    expect(getSiteUrl()).toBe("https://theopenstock.com");
  });

  it("getSiteUrl strips trailing slash", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://theopenstock.com/";
    expect(getSiteUrl()).toBe("https://theopenstock.com");
  });

  it("buildPageMetadata sets canonical and title template segment", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://theopenstock.com";
    const meta = buildPageMetadata({
      title: "Stock Screener",
      description: "Filter stocks.",
      path: "/screener",
    });
    expect(meta.title).toBe("Stock Screener");
    expect(meta.alternates?.canonical).toBe(
      "https://theopenstock.com/screener"
    );
    expect(meta.alternates?.types?.["application/rss+xml"]).toBe(
      "https://theopenstock.com/news/rss.xml"
    );
    expect(meta.openGraph?.title).toContain(SITE_NAME);
  });

  it("buildPageMetadata prepends page keywords when provided", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://theopenstock.com";
    const meta = buildPageMetadata({
      title: "The Open Stock vs Finviz",
      description: "Compare tools.",
      path: "/compare/finviz",
      keywords: ["finviz alternative"],
    });
    expect(meta.keywords).toEqual(
      expect.arrayContaining(["finviz alternative", "stock screener"])
    );
  });

  it("exposes a symbol SearchAction for crawlers", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://theopenstock.com";
    const jsonLd = buildWebSiteJsonLd();
    const site = jsonLd["@graph"].find(
      (node) => node["@type"] === "WebSite"
    ) as {
      potentialAction: { target: { urlTemplate: string } };
    };
    expect(site.potentialAction.target.urlTemplate).toBe(
      "https://theopenstock.com/?symbol={symbol}"
    );

    const organization = jsonLd["@graph"].find(
      (node) => node["@type"] === "Organization"
    ) as { description?: string };
    expect(organization.description).toMatch(/The Open Stock/);
  });
});
