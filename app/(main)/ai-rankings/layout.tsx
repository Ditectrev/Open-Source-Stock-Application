import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "AI Stock Rankings",
  description:
    "AI-ranked lists of the most promising stocks for short, medium, and long horizons — each pick validated with live quotes, technicals, and analyst data.",
  path: "/ai-rankings",
});

export default function AIStockRankingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
