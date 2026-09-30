import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { TERMS_DOCUMENT } from "@/lib/legal-content";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: TERMS_DOCUMENT.title,
  description: TERMS_DOCUMENT.description,
  path: TERMS_DOCUMENT.path,
  keywords: TERMS_DOCUMENT.keywords,
});

export default function TermsOfUsePage() {
  return <LegalDocumentPage document={TERMS_DOCUMENT} />;
}
