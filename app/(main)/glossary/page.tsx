import type { Metadata } from "next";
import { GlossaryPage } from "@/components/GlossaryPage";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Stock, ETF & Crypto Glossary",
  description:
    "Definitions of stocks, ETFs, cryptocurrency, and market analysis terms used in The Open Stock—screeners, heatmaps, RSI, MACD, Fear & Greed, and more.",
  path: "/glossary",
  keywords: [
    "stock market glossary",
    "ETF definitions",
    "crypto glossary",
    "RSI meaning",
    "MACD explained",
    "fear and greed index",
  ],
});

export default function GlossaryRoutePage() {
  return <GlossaryPage />;
}
