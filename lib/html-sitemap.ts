/**
 * Human-readable HTML sitemap groups for /sitemap.
 * Routes match the live app (not ditectrev.com agency/service pages).
 */

import { FOOTER_RESOURCES, FOOTER_TOOLS } from "@/lib/footer-content";
import { MAIN_NAV } from "@/lib/nav-routes";

export type SitemapLink = {
  label: string;
  href: string;
};

export type SitemapGroup = {
  id: string;
  label: string;
  links: readonly SitemapLink[];
};

const PRODUCT_LINKS: readonly SitemapLink[] = [
  ...MAIN_NAV.map((item) => ({ label: item.label, href: item.href })),
  { label: "Stock of the Day", href: "/stock-of-the-day" },
  { label: "Compare", href: "/compare" },
];

export const HTML_SITEMAP_GROUPS: readonly SitemapGroup[] = [
  {
    id: "product",
    label: "Product",
    links: PRODUCT_LINKS,
  },
  {
    id: "tools",
    label: "Tools",
    links: FOOTER_TOOLS,
  },
  {
    id: "resources",
    label: "Resources",
    links: FOOTER_RESOURCES,
  },
];

export function htmlSitemapPaths(): string[] {
  return HTML_SITEMAP_GROUPS.flatMap((group) =>
    group.links.map((link) => link.href)
  );
}
