import Link from "next/link";
import type { Metadata } from "next";
import { ErrorMessage } from "@/components/ErrorMessage";
import { DNA_BUTTON_SECONDARY, DNA_MARKETING_STACK } from "@/lib/design-dna";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "News story unavailable",
  description:
    "That headline is no longer in the live market news feed. See the latest stories on The Open Stock news hub.",
  path: "/news",
  noIndex: true,
});

export default function NewsArticleNotFound() {
  return (
    <div className={DNA_MARKETING_STACK}>
      <ErrorMessage
        type="generic"
        message="That news story is no longer in the live feed. Head back to news for the latest headlines."
      />
      <Link href="/news" className={DNA_BUTTON_SECONDARY}>
        More news
      </Link>
    </div>
  );
}
