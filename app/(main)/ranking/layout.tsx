import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Ranking",
  description:
    "Ranked buy and sell lists for ETFs, crypto, and stocks across short, medium, and long horizons — each pick validated with live quotes, technicals, and analyst data.",
  path: "/ranking",
});

export default function RankingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
