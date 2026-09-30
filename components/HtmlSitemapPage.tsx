import Link from "next/link";
import { HTML_SITEMAP_GROUPS } from "@/lib/html-sitemap";
import {
  DNA_BODY_SECONDARY,
  DNA_DISPLAY,
  DNA_EYEBROW,
  DNA_HEADING,
  DNA_HERO_LEAD,
  DNA_INSTRUMENT_PANEL,
  DNA_MARKETING_STACK,
  DNA_SECTION_RULE,
} from "@/lib/design-dna";
import { SITE_NAME } from "@/lib/site-seo";

const sitemapLinkClass =
  "underline decoration-stone-400 underline-offset-2 hover:text-stone-900 dark:hover:text-stone-100";

export function HtmlSitemapPage() {
  return (
    <div className={DNA_MARKETING_STACK} data-testid="sitemap-page">
      <header className={DNA_SECTION_RULE}>
        <p className={DNA_EYEBROW}>Resources · Directory</p>
        <h1 className={`mt-3 ${DNA_DISPLAY}`}>Sitemap</h1>
        <p className={`mt-4 max-w-3xl ${DNA_HERO_LEAD}`}>
          Public pages on {SITE_NAME}. Use this directory to jump to tools,
          product surfaces, and legal resources.
        </p>
        <p className={`mt-3 ${DNA_BODY_SECONDARY}`}>
          Machines can also read{" "}
          <a href="/sitemap.xml" className={sitemapLinkClass}>
            sitemap.xml
          </a>
          .
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HTML_SITEMAP_GROUPS.map((group) => (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`sitemap-${group.id}-heading`}
            className={DNA_INSTRUMENT_PANEL}
          >
            <h2 id={`sitemap-${group.id}-heading`} className={DNA_HEADING}>
              {group.label}
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={sitemapLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
