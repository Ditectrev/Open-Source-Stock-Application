import type { Metadata } from "next";
import { LegalPlaceholderPage } from "@/components/LegalPlaceholderPage";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy & Security",
  description: "Privacy and security for The Open Stock.",
  path: "/privacy-and-security",
});

export default function PrivacyAndSecurityPage() {
  return <LegalPlaceholderPage title="Privacy & Security" />;
}
