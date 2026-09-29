import type { Metadata } from "next";
import { HtmlSitemapPage } from "@/components/HtmlSitemapPage";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Sitemap",
  description:
    "Directory of public The Open Stock pages: charts, news, ranking, tools, glossary, and legal resources.",
  path: "/sitemap",
  keywords: ["sitemap", "site directory"],
});

export default function SitemapPage() {
  return <HtmlSitemapPage />;
}
