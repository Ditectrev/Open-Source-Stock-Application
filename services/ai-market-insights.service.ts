import { marketDataService } from "@/services/market-data.service";
import { AIIntegrationService } from "@/services/ai-integration.service";
import { logger } from "@/lib/logger";
import type {
  AIPredictionReport,
  AIProvider,
  FearGreedData,
  ForecastData,
  MarketIndex,
  StockOfTheDay,
  TechnicalIndicators,
} from "@/types";

type PredictionEnhancement = Pick<
  AIPredictionReport,
  | "summary"
  | "politicalFactors"
  | "financialTrendFactors"
  | "geopoliticalFactors"
  | "riskFactors"
>;

type StockEnhancement = Pick<StockOfTheDay, "rationale">;

type AssetType = AIPredictionReport["assetType"];
type Recommendation = AIPredictionReport["recommendation"];
type LLMConfig = {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
};

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

function getLLMConfigFromEnv(): {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
} | null {
  const providerEnv = process.env.AI_PROVIDER;
  if (!providerEnv) return null;

  const provider = providerEnv.toUpperCase() as AIProvider;
  const allowed = new Set<AIProvider>([
    "OLLAMA",
    "OPENAI",
    "GEMINI",
    "MISTRAL",
    "DEEPSEEK",
    "HOSTED",
  ]);

  if (!allowed.has(provider)) return null;

  // Optional model override for any provider.
  const model =
    process.env.AI_MODEL ??
    (provider === "OLLAMA" ? process.env.OLLAMA_MODEL : undefined);

  // Ollama doesn't require an API key.
  if (provider === "OLLAMA") {
    return { provider, model };
  }

  // For now, before Appwrite/Stripe wiring, we support BYOK via env for non-Ollama providers.
  if (
    provider === "OPENAI" ||
    provider === "GEMINI" ||
    provider === "MISTRAL" ||
    provider === "DEEPSEEK"
  ) {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) return null;
    return { provider, apiKey, model };
  }

  // Hosted AI and OLLAMA can be added next; skip if not configured.
  return null;
}

function extractFirstJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const codeBlock = trimmed.match(/```json\s*([\s\S]*?)```/i)?.[1];
  const fallbackCandidate =
    codeBlock ?? trimmed.match(/\{[\s\S]*\}/)?.[0] ?? null;

  if (!fallbackCandidate) return null;

  try {
    const parsed = JSON.parse(fallbackCandidate) as Record<string, unknown>;
    return parsed;
  } catch {
    return null;
  }
}

export class AIMarketInsightsService {
  async generatePrediction(
    symbol: string,
    llmConfig?: LLMConfig
  ): Promise<AIPredictionReport> {
    const quote = await marketDataService
      .getSymbolData(symbol)
      .catch((error) => {
        logger.warn("Using fallback quote for AI prediction", {
          symbol,
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          symbol: symbol.toUpperCase(),
          name: `${symbol.toUpperCase()} Inc.`,
          price: 100,
          change: 0,
          changePercent: 0,
          marketCap: 100000000000,
          volume: 1000000,
          fiftyTwoWeekHigh: 120,
          fiftyTwoWeekLow: 80,
          lastUpdated: new Date(),
        };
      });

    const [indicators, forecast, fearGreed, worldMarkets] = await Promise.all([
      marketDataService.getTechnicalIndicators(symbol).catch((error) => {
        logger.warn("Using fallback indicators for AI prediction", {
          symbol,
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          rsi: { value: 50, signal: "fair" as const },
          macd: { value: 0, signal: 0, histogram: 0, trend: "fair" as const },
          movingAverages: { ma50: 0, ma200: 0, signal: "fair" as const },
          bollingerBands: {
            upper: 0,
            middle: 0,
            lower: 0,
            signal: "fair" as const,
          },
          overallSentiment: "fair" as const,
        };
      }),
      marketDataService.getForecastData(symbol).catch((error) => {
        logger.warn("Using fallback forecast for AI prediction", {
          symbol,
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          priceTargets: {
            low: quote.price * 0.95,
            average: quote.price,
            high: quote.price * 1.05,
          },
          analystRatings: {
            strongBuy: 0,
            buy: 0,
            hold: 1,
            sell: 0,
            strongSell: 0,
          },
          epsForecasts: [],
          revenueForecasts: [],
        };
      }),
      marketDataService.getFearGreedIndex(7).catch((error) => {
        logger.warn("Using fallback fear/greed for AI prediction", {
          symbol,
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          value: 50,
          label: "Neutral" as const,
          timestamp: new Date(),
          history: [],
        };
      }),
      marketDataService.getWorldMarkets().catch((error) => {
        logger.warn("Using fallback world markets for AI prediction", {
          symbol,
          error: error instanceof Error ? error.message : String(error),
        });
        return [];
      }),
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

    const assetType = detectAssetType(symbol);

    // Keep deterministic output as the baseline; enhance text fields with the LLM when configured.
    const heuristic: AIPredictionReport = {
      symbol,
      assetType,
      generatedAt: new Date(),
      recommendation,
      confidence,
      summary: `AI signals for ${symbol} currently point to a ${recommendation.toUpperCase()} stance. The model combines analyst targets, technical momentum, and macro risk proxies to estimate near-term direction.`,
      politicalFactors: [
        "Election-cycle policy uncertainty can shift sector-specific capital flows.",
        "Central bank communication remains a key catalyst for risk repricing.",
        "Regulatory headlines can move sector sentiment quickly.",
      ],
      financialTrendFactors: [
        `Average analyst target implies ${(targetUpside * 100).toFixed(1)}% relative upside from current price.`,
        `Technical model flags current sentiment as "${indicators.overallSentiment}".`,
        `Fear & Greed bias is ${fearGreed.value <= 35 ? "contrarian (slightly bullish)" : fearGreed.value >= 70 ? "cautious (slightly bearish)" : "neutral"} today.`,
      ],
      geopoliticalFactors: [
        strongestRegion
          ? `${strongestRegion.region} is currently the strongest major region (${strongestRegion.changePercent.toFixed(2)}%).`
          : "No clear regional outperformance signal.",
        weakestRegion
          ? `${weakestRegion.region} is currently the weakest major region (${weakestRegion.changePercent.toFixed(2)}%), increasing volatility risk.`
          : "No clear regional weakness signal.",
        "Cross-region risk correlations can amplify moves during regime shifts.",
      ],
      riskFactors: [
        "Unexpected macro headlines can invalidate short-horizon AI signals quickly.",
        "Market regime changes can reduce model reliability without warning.",
        "Liquidity conditions can change faster than model assumptions.",
      ],
    };

    const enhanced = await this.maybeEnhancePrediction(
      {
        symbol,
        assetType,
        recommendation,
        confidence,
        quote,
        indicators,
        forecast,
        fearGreed,
        strongestRegion,
        weakestRegion,
        targetUpside,
      },
      llmConfig
    );

    return enhanced
      ? { ...heuristic, ...enhanced, generatedAt: new Date() }
      : heuristic;
  }

  async getStockOfTheDay(llmConfig?: LLMConfig): Promise<StockOfTheDay> {
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

    const heuristic: StockOfTheDay = {
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

    const enhanced = await this.maybeEnhanceStockOfTheDay(
      {
        symbol: heuristic.symbol,
        name: heuristic.name,
        assetType: heuristic.assetType,
        recommendation,
        confidence: heuristic.confidence,
        score: top?.score ?? 0.1,
        recommendationStance:
          recommendation === "buy"
            ? "bullish"
            : recommendation === "sell"
              ? "bearish"
              : "neutral",
      },
      llmConfig
    );

    return enhanced
      ? { ...heuristic, ...enhanced, generatedAt: new Date() }
      : heuristic;
  }

  private async maybeEnhancePrediction(
    args: {
      symbol: string;
      assetType: AssetType;
      recommendation: Recommendation;
      confidence: number;
      quote: { price: number; changePercent: number };
      indicators: TechnicalIndicators;
      forecast: ForecastData;
      fearGreed: FearGreedData;
      strongestRegion?: MarketIndex;
      weakestRegion?: MarketIndex;
      targetUpside: number;
    },
    llmConfig?: LLMConfig
  ): Promise<PredictionEnhancement | null> {
    const llm = llmConfig ?? getLLMConfigFromEnv();
    if (!llm) return null;

    const stance =
      args.recommendation === "buy"
        ? "bullish"
        : args.recommendation === "sell"
          ? "bearish"
          : "neutral";

    const prompt = `You are a financial analyst.
Return ONLY valid JSON (no markdown, no commentary) in this exact shape:
{
  "summary": string,
  "politicalFactors": string[],
  "financialTrendFactors": string[],
  "geopoliticalFactors": string[],
  "riskFactors": string[]
}
Rules:
- summary: 1 short paragraph; do NOT use the words "buy" or "sell" (use "bullish"/"bearish"/"neutral" instead).
- Each *_Factors array: exactly 3 short strings.

Inputs:
symbol: ${args.symbol}
assetType: ${args.assetType}
stance: ${stance}
confidence: ${args.confidence}
currentPrice: ${args.quote.price}
priceChangePercent: ${args.quote.changePercent}

Technical:
- RSI: ${args.indicators.rsi.value.toFixed(1)} (${args.indicators.rsi.signal})
- MACD histogram: ${args.indicators.macd.histogram.toFixed(4)} (trend: ${args.indicators.macd.trend})
- Overall sentiment: ${args.indicators.overallSentiment}

Forecast:
- average target: ${args.forecast.priceTargets.average}
- low/high targets: ${args.forecast.priceTargets.low}/${args.forecast.priceTargets.high}

Fear & Greed:
- value: ${args.fearGreed.value}

World markets:
${args.strongestRegion ? `Strongest: ${args.strongestRegion.region} (${args.strongestRegion.changePercent.toFixed(2)}%)` : "Strongest: N/A"}
${args.weakestRegion ? `Weakest: ${args.weakestRegion.region} (${args.weakestRegion.changePercent.toFixed(2)}%)` : "Weakest: N/A"}
targetUpsidePercent: ${(args.targetUpside * 100).toFixed(1)}
`;

    try {
      const service = new AIIntegrationService();
      await service.setAIProvider(llm.provider, {
        provider: llm.provider,
        apiKey: llm.apiKey,
        model: llm.model,
        settings: {},
      });

      const raw = await service.runRawPrompt(prompt);
      const parsed = extractFirstJsonObject(raw);

      if (!parsed) return null;

      const summary =
        typeof parsed.summary === "string" ? parsed.summary : null;
      const politicalFactors = Array.isArray(parsed.politicalFactors)
        ? parsed.politicalFactors.filter(
            (x): x is string => typeof x === "string"
          )
        : [];
      const financialTrendFactors = Array.isArray(parsed.financialTrendFactors)
        ? parsed.financialTrendFactors.filter(
            (x): x is string => typeof x === "string"
          )
        : [];
      const geopoliticalFactors = Array.isArray(parsed.geopoliticalFactors)
        ? parsed.geopoliticalFactors.filter(
            (x): x is string => typeof x === "string"
          )
        : [];
      const riskFactors = Array.isArray(parsed.riskFactors)
        ? parsed.riskFactors.filter((x): x is string => typeof x === "string")
        : [];

      if (!summary) return null;
      if (
        politicalFactors.length !== 3 ||
        financialTrendFactors.length !== 3 ||
        geopoliticalFactors.length !== 3 ||
        riskFactors.length !== 3
      ) {
        logger.warn(
          "LLM prediction enhancement returned unexpected factor lengths",
          {
            symbol: args.symbol,
          }
        );
        return null;
      }

      return {
        summary,
        politicalFactors,
        financialTrendFactors,
        geopoliticalFactors,
        riskFactors,
      };
    } catch (error) {
      logger.warn(
        "LLM prediction enhancement failed; falling back to heuristic",
        {
          symbol: args.symbol,
          error: error instanceof Error ? error.message : String(error),
        }
      );
      return null;
    }
  }

  private async maybeEnhanceStockOfTheDay(
    args: {
      symbol: string;
      name: string;
      assetType: StockOfTheDay["assetType"];
      recommendation: Recommendation;
      confidence: number;
      score: number;
      recommendationStance: "bullish" | "bearish" | "neutral";
    },
    llmConfig?: LLMConfig
  ): Promise<StockEnhancement | null> {
    const llm = llmConfig ?? getLLMConfigFromEnv();
    if (!llm) return null;

    const prompt = `You are a financial analyst.
Return ONLY valid JSON in this exact shape:
{ "rationale": string[] }
Rules:
- rationale: exactly 3 short strings (no markdown, no commentary).
- Do NOT use the words "buy" or "sell".

Inputs:
symbol: ${args.symbol}
name: ${args.name}
assetType: ${args.assetType}
stance: ${args.recommendationStance}
confidence: ${args.confidence}
rankScore: ${args.score}
`;

    try {
      const service = new AIIntegrationService();
      await service.setAIProvider(llm.provider, {
        provider: llm.provider,
        apiKey: llm.apiKey,
        model: llm.model,
        settings: {},
      });

      const raw = await service.runRawPrompt(prompt);
      const parsed = extractFirstJsonObject(raw);
      const rationale = Array.isArray(parsed?.rationale)
        ? parsed.rationale.filter((x): x is string => typeof x === "string")
        : [];

      if (rationale.length !== 3) return null;
      return { rationale };
    } catch (error) {
      logger.warn(
        "LLM stock-of-the-day enhancement failed; falling back to heuristic",
        {
          symbol: args.symbol,
          error: error instanceof Error ? error.message : String(error),
        }
      );
      return null;
    }
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
