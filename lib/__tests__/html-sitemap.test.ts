import { describe, expect, it } from "vitest";
import { FOOTER_RESOURCES, FOOTER_TOOLS } from "@/lib/footer-content";
import { htmlSitemapPaths, HTML_SITEMAP_GROUPS } from "@/lib/html-sitemap";

describe("html-sitemap", () => {
  it("lists footer tools and resources", () => {
    const paths = htmlSitemapPaths();
    for (const item of [...FOOTER_TOOLS, ...FOOTER_RESOURCES]) {
      expect(paths).toContain(item.href);
    }
  });

  it("does not list agency service pages", () => {
    const paths = htmlSitemapPaths();
    expect(paths).not.toContain("/services");
    expect(paths).not.toContain("/methodology");
    expect(paths).not.toContain("/about-us");
  });

  it("groups product, tools, and resources", () => {
    expect(HTML_SITEMAP_GROUPS.map((group) => group.id)).toEqual([
      "product",
      "tools",
      "resources",
    ]);
  });
});
