import type { Metadata } from "next";
import { LegalPlaceholderPage } from "@/components/LegalPlaceholderPage";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Copyrights",
  description: "Copyrights for The Open Stock.",
  path: "/copyrights",
});

export default function CopyrightsPage() {
  return <LegalPlaceholderPage title="Copyrights" />;
}
