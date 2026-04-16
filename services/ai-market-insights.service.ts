import { marketDataService } from "@/services/market-data.service";
import type { AIPredictionReport, StockOfTheDay } from "@/types";

type AssetType = AIPredictionReport["assetType"];
type Recommendation = AIPredictionReport["recommendation"];

function detectAssetType(symbol: string): AssetType {
  if (symbol.includes("-USD")) return "crypto";
  if (symbol.endsWith("=F")) return "commodity";
  if (symbol.endsWith("=X")) return "forex";
  if (symbol.includes("ETF")) return "etf";
  return "stock";
}

function toRecommendation(score: number): Recommendation {
  if (score >= 0.2) return "buy";
  if (score <= -0.2) return "sell";
  return "hold";
}

function boundedConfidence(score: number): number {
  const normalized = Math.min(
    0.95,
    Math.max(0.55, 0.65 + Math.abs(score) * 0.2)
  );
  return Number(normalized.toFixed(2));
}

export class AIMarketInsightsService {
  async generatePrediction(symbol: string): Promise<AIPredictionReport> {
    const [quote, indicators, forecast, fearGreed, worldMarkets] =
      await Promise.all([
        marketDataService.getSymbolData(symbol),
        marketDataService.getTechnicalIndicators(symbol),
        marketDataService.getForecastData(symbol),
        marketDataService.getFearGreedIndex(7),
        marketDataService.getWorldMarkets(),
      ]);

    const targetUpside =
      quote.price > 0
        ? (forecast.priceTargets.average - quote.price) / quote.price
        : 0;
    const sentimentScore =
      indicators.overallSentiment === "underpriced"
        ? 0.25
        : indicators.overallSentiment === "overpriced"
          ? -0.25
          : 0;
    const fearGreedBias =
      fearGreed.value <= 35 ? 0.1 : fearGreed.value >= 70 ? -0.1 : 0;
    const score = targetUpside + sentimentScore + fearGreedBias;
    const recommendation = toRecommendation(score);
    const confidence = boundedConfidence(score);

    const weakestRegion = [...worldMarkets].sort(
      (a, b) => a.changePercent - b.changePercent
    )[0];
    const strongestRegion = [...worldMarkets].sort(
      (a, b) => b.changePercent - a.changePercent
    )[0];

    const summary = `AI signals for ${symbol} currently point to a ${recommendation.toUpperCase()} stance. The model combines analyst targets, technical momentum, and macro risk proxies to estimate near-term direction.`;

    return {
      symbol,
      assetType: detectAssetType(symbol),
      generatedAt: new Date(),
      recommendation,
      confidence,
      summary,
      politicalFactors: [
        "Election-cycle policy uncertainty can shift sector-specific capital flows.",
        "Central bank communication remains a key catalyst for risk repricing.",
      ],
      financialTrendFactors: [
        `Average analyst target implies ${(targetUpside * 100).toFixed(1)}% relative upside from current price.`,
        `Technical model flags current sentiment as "${indicators.overallSentiment}".`,
      ],
      geopoliticalFactors: [
        strongestRegion
          ? `${strongestRegion.region} is currently the strongest major region (${strongestRegion.changePercent.toFixed(2)}%).`
          : "No clear regional outperformance signal.",
        weakestRegion
          ? `${weakestRegion.region} is currently the weakest major region (${weakestRegion.changePercent.toFixed(2)}%), increasing volatility risk.`
          : "No clear regional weakness signal.",
      ],
      riskFactors: [
        "Unexpected macro headlines can invalidate short-horizon AI signals quickly.",
        "Market regime changes can reduce model reliability without warning.",
      ],
    };
  }

  async getStockOfTheDay(): Promise<StockOfTheDay> {
    const [stocks, crypto] = await Promise.all([
      marketDataService.getStockPerformance("1d"),
      marketDataService.getCryptoPerformance("1d"),
    ]);

    const stockCandidates = stocks.slice(0, 20).map((item) => ({
      symbol: item.symbol,
      name: item.name,
      assetType: "stock" as const,
      score: this.scoreCandidate(
        item.changePercent,
        item.volume,
        item.marketCap
      ),
    }));

    const cryptoCandidates = crypto.slice(0, 10).map((item) => ({
      symbol: item.symbol,
      name: item.name,
      assetType: "crypto" as const,
      score: this.scoreCandidate(item.changePercent, undefined, item.marketCap),
    }));

    const allCandidates = [...stockCandidates, ...cryptoCandidates];
    allCandidates.sort((a, b) => b.score - a.score);
    const top = allCandidates[0];

    const recommendation = toRecommendation(top?.score ?? 0);

    return {
      generatedAt: new Date(),
      symbol: top?.symbol ?? "AAPL",
      name: top?.name ?? "Apple Inc.",
      assetType: top?.assetType ?? "stock",
      recommendation,
      confidence: boundedConfidence(top?.score ?? 0.1),
      rationale: [
        "Selected by momentum-quality ranking on top market movers.",
        "Filters out extreme one-day spikes by applying capped score weighting.",
        "Balances momentum with liquidity/size inputs to reduce noise.",
      ],
    };
  }

  private scoreCandidate(
    changePercent: number,
    volume?: number,
    marketCap?: number
  ): number {
    const momentum = Math.max(-8, Math.min(8, changePercent)) / 8;
    const liquidity = volume ? Math.log10(Math.max(1, volume)) / 10 : 0.35;
    const size = marketCap ? Math.log10(Math.max(1, marketCap)) / 12 : 0.3;
    return momentum * 0.6 + liquidity * 0.25 + size * 0.15;
  }
}

export const aiMarketInsightsService = new AIMarketInsightsService();
