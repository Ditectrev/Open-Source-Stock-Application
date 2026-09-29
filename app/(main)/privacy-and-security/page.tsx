import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { PRIVACY_DOCUMENT } from "@/lib/legal-content";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: PRIVACY_DOCUMENT.title,
  description: PRIVACY_DOCUMENT.description,
  path: PRIVACY_DOCUMENT.path,
  keywords: PRIVACY_DOCUMENT.keywords,
});

export default function PrivacyAndSecurityPage() {
  return <LegalDocumentPage document={PRIVACY_DOCUMENT} />;
}
