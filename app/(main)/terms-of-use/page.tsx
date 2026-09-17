import type { Metadata } from "next";
import { LegalPlaceholderPage } from "@/components/LegalPlaceholderPage";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use",
  description: "Terms of use for The Open Stock.",
  path: "/terms-of-use",
});

export default function TermsOfUsePage() {
  return <LegalPlaceholderPage title="Terms of Use" />;
}
