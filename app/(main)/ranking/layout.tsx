import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Ranking",
  description:
    "Ranked lists of the most promising stocks for short, medium, and long horizons — each pick validated with live quotes, technicals, and analyst data.",
  path: "/ranking",
});

export default function RankingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
