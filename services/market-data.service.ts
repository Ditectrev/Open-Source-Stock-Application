/**
 * Market Data Service
 * Orchestrates data fetching from external APIs with caching and rate limiting
 */

import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import { cacheService } from "@/lib/cache";
import { rateLimiter } from "@/lib/rate-limiter";
import { yahooFinanceService } from "./yahoo-finance.service";
import { cnnApiService } from "./cnn-api.service";
import {
  SymbolData,
  PriceData,
  TechnicalIndicators,
  ForecastData,
  SeasonalData,
  FinancialData,
  FearGreedData,
  MarketIndex,
  SectorData,
  TimeRange,
} from "@/types";

export class MarketDataService {
  private cacheTTL: number;

  constructor() {
    this.cacheTTL = env.cache.ttlSeconds;
  }

  /**
   * Get symbol data with caching and rate limiting
   */
  async getSymbolData(symbol: string): Promise<SymbolData> {
    const cacheKey = cacheService.generateKey(symbol, "quote");

    // Check cache first
    const cached = cacheService.get<SymbolData>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check rate limit
    const endpoint = `yahoo:quote:${symbol}`;
    const allowed = await rateLimiter.checkLimit(endpoint);
    
    if (!allowed) {
      logger.warn("Rate limit exceeded, serving stale cache if available", { symbol });
      // Try to serve stale cache
      const stale = cacheService.get<SymbolData>(cacheKey);
      if (stale) return stale;
      
      throw new Error("Rate limit exceeded and no cached data available");
    }

    // Fetch from API
    const data = await yahooFinanceService.getSymbolQuote(symbol);
    rateLimiter.recordCall(endpoint);

    // Cache the result
    cacheService.set(cacheKey, data, this.cacheTTL);

    return data;
  }

  /**
   * Get historical prices with caching and rate limiting
   */
  async getHistoricalPrices(symbol: string, range: TimeRange): Promise<PriceData[]> {
    const cacheKey = cacheService.generateKey(symbol, `historical:${range}`);

    // Check cache first
    const cached = cacheService.get<PriceData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check rate limit
    const endpoint = `yahoo:historical:${symbol}`;
    const allowed = await rateLimiter.checkLimit(endpoint);
    
    if (!allowed) {
      logger.warn("Rate limit exceeded, serving stale cache if available", { symbol, range });
      const stale = cacheService.get<PriceData[]>(cacheKey);
      if (stale) return stale;
      
      throw new Error("Rate limit exceeded and no cached data available");
    }

    // Fetch from API
    const data = await yahooFinanceService.getHistoricalData(symbol, range);
    rateLimiter.recordCall(endpoint);

    // Cache the result
    cacheService.set(cacheKey, data, this.cacheTTL);

    return data;
  }

  /**
   * Get technical indicators (calculated from price data)
   */
  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
    const cacheKey = cacheService.generateKey(symbol, "indicators");

    // Check cache first
    const cached = cacheService.get<TechnicalIndicators>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get historical data to calculate indicators
    const priceData = await this.getHistoricalPrices(symbol, "1Y");
    
    // Calculate indicators
    const indicators = this.calculateIndicators(priceData);

    // Cache the result
    cacheService.set(cacheKey, indicators, this.cacheTTL);

    return indicators;
  }

  /**
   * Get forecast data (placeholder - would integrate with analyst data API)
   */
  async getForecastData(symbol: string): Promise<ForecastData> {
    const cacheKey = cacheService.generateKey(symbol, "forecast");

    // Check cache first
    const cached = cacheService.get<ForecastData>(cacheKey);
    if (cached) {
      return cached;
    }

    // Placeholder implementation - would integrate with real forecast API
    const forecast: ForecastData = {
      priceTargets: {
        low: 0,
        average: 0,
        high: 0,
      },
      analystRatings: {
        strongBuy: 0,
        buy: 0,
        hold: 0,
        sell: 0,
        strongSell: 0,
      },
      epsForecasts: [],
      revenueForecasts: [],
    };

    // Cache the result
    cacheService.set(cacheKey, forecast, this.cacheTTL);

    return forecast;
  }

  /**
   * Get seasonal patterns (calculated from historical data)
   */
  async getSeasonalPatterns(symbol: string): Promise<SeasonalData> {
    const cacheKey = cacheService.generateKey(symbol, "seasonal");

    // Check cache first
    const cached = cacheService.get<SeasonalData>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get max historical data
    const priceData = await this.getHistoricalPrices(symbol, "Max");
    
    // Calculate seasonal patterns
    const seasonal = this.calculateSeasonalPatterns(priceData);

    // Cache the result
    cacheService.set(cacheKey, seasonal, this.cacheTTL);

    return seasonal;
  }

  /**
   * Get financials with caching and rate limiting
   */
  async getFinancials(symbol: string): Promise<FinancialData> {
    const cacheKey = cacheService.generateKey(symbol, "financials");

    // Check cache first
    const cached = cacheService.get<FinancialData>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check rate limit
    const endpoint = `yahoo:financials:${symbol}`;
    const allowed = await rateLimiter.checkLimit(endpoint);
    
    if (!allowed) {
      logger.warn("Rate limit exceeded, serving stale cache if available", { symbol });
      const stale = cacheService.get<FinancialData>(cacheKey);
      if (stale) return stale;
      
      throw new Error("Rate limit exceeded and no cached data available");
    }

    // Fetch from API
    const data = await yahooFinanceService.getFinancials(symbol);
    rateLimiter.recordCall(endpoint);

    // Cache the result
    cacheService.set(cacheKey, data, this.cacheTTL);

    return data;
  }

  /**
   * Get Fear & Greed Index with caching and rate limiting
   */
  async getFearGreedIndex(): Promise<FearGreedData> {
    const cacheKey = "market:fear-greed";

    // Check cache first
    const cached = cacheService.get<FearGreedData>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check rate limit
    const endpoint = "cnn:fear-greed";
    const allowed = await rateLimiter.checkLimit(endpoint);
    
    if (!allowed) {
      logger.warn("Rate limit exceeded, serving stale cache if available");
      const stale = cacheService.get<FearGreedData>(cacheKey);
      if (stale) return stale;
      
      throw new Error("Rate limit exceeded and no cached data available");
    }

    // Fetch from API
    const data = await cnnApiService.getFearGreedIndex();
    rateLimiter.recordCall(endpoint);

    // Cache the result
    cacheService.set(cacheKey, data, this.cacheTTL);

    return data;
  }

  /**
   * Get world markets with caching and rate limiting
   */
  async getWorldMarkets(): Promise<MarketIndex[]> {
    const cacheKey = "market:world-markets";

    // Check cache first
    const cached = cacheService.get<MarketIndex[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check rate limit
    const endpoint = "cnn:world-markets";
    const allowed = await rateLimiter.checkLimit(endpoint);
    
    if (!allowed) {
      logger.warn("Rate limit exceeded, serving stale cache if available");
      const stale = cacheService.get<MarketIndex[]>(cacheKey);
      if (stale) return stale;
      
      throw new Error("Rate limit exceeded and no cached data available");
    }

    // Fetch from API
    const data = await cnnApiService.getWorldMarkets();
    rateLimiter.recordCall(endpoint);

    // Cache the result
    cacheService.set(cacheKey, data, this.cacheTTL);

    return data;
  }

  /**
   * Get sector performance (placeholder - would integrate with sector data API)
   */
  async getSectorPerformance(): Promise<SectorData[]> {
    const cacheKey = "market:sectors";

    // Check cache first
    const cached = cacheService.get<SectorData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Placeholder implementation
    const sectors: SectorData[] = [
      { sector: "Technology", performance: 0, changePercent: 0, constituents: 0 },
      { sector: "Financial", performance: 0, changePercent: 0, constituents: 0 },
      { sector: "Healthcare", performance: 0, changePercent: 0, constituents: 0 },
    ];

    // Cache the result
    cacheService.set(cacheKey, sectors, this.cacheTTL);

    return sectors;
  }

  /**
   * Invalidate cache for a symbol
   */
  async invalidateCache(symbol: string): Promise<void> {
    cacheService.invalidateSymbol(symbol);
    logger.info("Cache invalidated for symbol", { symbol });
  }

  /**
   * Calculate technical indicators from price data
   */
  private calculateIndicators(priceData: PriceData[]): TechnicalIndicators {
    if (priceData.length === 0) {
      return this.getDefaultIndicators();
    }

    const closes = priceData.map((p) => p.close);
    
    // Calculate RSI
    const rsi = this.calculateRSI(closes);
    
    // Calculate Moving Averages
    const ma50 = this.calculateMA(closes, 50);
    const ma200 = this.calculateMA(closes, 200);
    
    // Determine signals
    const rsiSignal = rsi > 70 ? "overpriced" : rsi < 30 ? "underpriced" : "fair";
    const maSignal = ma50 > ma200 ? "underpriced" : ma50 < ma200 ? "overpriced" : "fair";

    return {
      rsi: { value: rsi, signal: rsiSignal },
      macd: { value: 0, signal: 0, histogram: 0, trend: "fair" },
      movingAverages: { ma50, ma200, signal: maSignal },
      bollingerBands: { upper: 0, middle: 0, lower: 0, signal: "fair" },
      overallSentiment: "fair",
    };
  }

  /**
   * Calculate RSI (Relative Strength Index)
   */
  private calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = closes.length - period; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  /**
   * Calculate Moving Average
   */
  private calculateMA(closes: number[], period: number): number {
    if (closes.length < period) return closes[closes.length - 1] || 0;

    const slice = closes.slice(-period);
    return slice.reduce((sum, val) => sum + val, 0) / period;
  }

  /**
   * Calculate seasonal patterns from historical data
   */
  private calculateSeasonalPatterns(priceData: PriceData[]): SeasonalData {
    const heatmap: Array<{ year: number; month: number; return: number }> = [];
    const monthlyReturns: Record<number, number[]> = {};

    // Group by year and month
    for (let i = 1; i < priceData.length; i++) {
      const date = new Date(priceData[i].timestamp);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const prevClose = priceData[i - 1].close;
      const currClose = priceData[i].close;
      const returnPct = ((currClose - prevClose) / prevClose) * 100;

      heatmap.push({ year, month, return: returnPct });

      if (!monthlyReturns[month]) monthlyReturns[month] = [];
      monthlyReturns[month].push(returnPct);
    }

    // Calculate average by month
    const averageByMonth: Record<number, number> = {};
    for (const month in monthlyReturns) {
      const returns = monthlyReturns[month];
      averageByMonth[month] = returns.reduce((sum, val) => sum + val, 0) / returns.length;
    }

    return { heatmap, averageByMonth };
  }

  /**
   * Get default indicators when data is insufficient
   */
  private getDefaultIndicators(): TechnicalIndicators {
    return {
      rsi: { value: 50, signal: "fair" },
      macd: { value: 0, signal: 0, histogram: 0, trend: "fair" },
      movingAverages: { ma50: 0, ma200: 0, signal: "fair" },
      bollingerBands: { upper: 0, middle: 0, lower: 0, signal: "fair" },
      overallSentiment: "fair",
    };
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();
