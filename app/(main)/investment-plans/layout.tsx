import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "AI Investment Plans",
  description:
    "Paid AI portfolio ideas: Defensive, Balanced, Growth, Dividend, and Aggressive Growth, each with a risk score and an interactive allocation chart.",
  path: "/investment-plans",
});

export default function InvestmentPlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
