import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { COPYRIGHTS_DOCUMENT } from "@/lib/legal-content";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: COPYRIGHTS_DOCUMENT.title,
  description: COPYRIGHTS_DOCUMENT.description,
  path: COPYRIGHTS_DOCUMENT.path,
  keywords: COPYRIGHTS_DOCUMENT.keywords,
});

export default function CopyrightsPage() {
  return <LegalDocumentPage document={COPYRIGHTS_DOCUMENT} />;
}
