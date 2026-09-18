import type { Metadata } from "next";
import { LegalPlaceholderPage } from "@/components/LegalPlaceholderPage";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Sitemap",
  description: "Sitemap for The Open Stock.",
  path: "/sitemap",
});

export default function SitemapPage() {
  return <LegalPlaceholderPage title="Sitemap" />;
}
