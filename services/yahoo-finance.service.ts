/**
 * Yahoo Finance API Client
 * Handles symbol quotes, historical data, and financial statements
 */

import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import { retryWithBackoff } from "@/lib/retry";
import {
  SymbolData,
  PriceData,
  FinancialData,
  TimeRange,
  TechnicalIndicators,
  ForecastData,
  SeasonalData,
} from "@/types";

export class YahooFinanceService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.apis.yahooFinanceUrl;
  }

  /**
   * Fetch symbol quote data
   */
  async getSymbolQuote(symbol: string): Promise<SymbolData> {
    return retryWithBackoff(
      async () => {
        try {
          const response = await fetch(
            `${this.baseUrl}/v8/finance/quote?symbols=${symbol}`,
            {
              headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          if (!data.quoteResponse?.result?.[0]) {
            throw new Error(`Symbol not found: ${symbol}`);
          }

          return this.parseQuoteResponse(data.quoteResponse.result[0]);
        } catch (error) {
          logger.error("Failed to fetch symbol quote", error as Error, {
            symbol,
            baseUrl: this.baseUrl,
          });
          throw error;
        }
      },
      `YahooFinance:Quote:${symbol}`
    );
  }

  /**
   * Fetch historical price data
   */
  async getHistoricalData(symbol: string, range: TimeRange): Promise<PriceData[]> {
    return retryWithBackoff(
      async () => {
        try {
          const { interval, period } = this.getTimeRangeParams(range);
          
          const response = await fetch(
            `${this.baseUrl}/v8/finance/chart/${symbol}?interval=${interval}&range=${period}`,
            {
              headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          if (!data.chart?.result?.[0]) {
            throw new Error(`No historical data found for symbol: ${symbol}`);
          }

          return this.parseHistoricalResponse(data.chart.result[0]);
        } catch (error) {
          logger.error("Failed to fetch historical data", error as Error, {
            symbol,
            range,
            baseUrl: this.baseUrl,
          });
          throw error;
        }
      },
      `YahooFinance:Historical:${symbol}`
    );
  }

  /**
   * Fetch financial statements
   */
  async getFinancials(symbol: string): Promise<FinancialData> {
    return retryWithBackoff(
      async () => {
        try {
          const response = await fetch(
            `${this.baseUrl}/v10/finance/quoteSummary/${symbol}?modules=financialData,defaultKeyStatistics,summaryDetail`,
            {
              headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          if (!data.quoteSummary?.result?.[0]) {
            throw new Error(`No financial data found for symbol: ${symbol}`);
          }

          return this.parseFinancialsResponse(data.quoteSummary.result[0]);
        } catch (error) {
          logger.error("Failed to fetch financials", error as Error, {
            symbol,
            baseUrl: this.baseUrl,
          });
          throw error;
        }
      },
      `YahooFinance:Financials:${symbol}`
    );
  }

  /**
   * Parse quote response
   */
  private parseQuoteResponse(quote: any): SymbolData {
    return {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || quote.symbol,
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      marketCap: quote.marketCap || 0,
      volume: quote.regularMarketVolume || 0,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
      lastUpdated: new Date(quote.regularMarketTime * 1000 || Date.now()),
    };
  }

  /**
   * Parse historical data response
   */
  private parseHistoricalResponse(chart: any): PriceData[] {
    const timestamps = chart.timestamp || [];
    const quotes = chart.indicators?.quote?.[0] || {};
    
    const open = quotes.open || [];
    const high = quotes.high || [];
    const low = quotes.low || [];
    const close = quotes.close || [];
    const volume = quotes.volume || [];

    return timestamps.map((timestamp: number, index: number) => ({
      timestamp: new Date(timestamp * 1000),
      open: open[index] || 0,
      high: high[index] || 0,
      low: low[index] || 0,
      close: close[index] || 0,
      volume: volume[index] || 0,
    }));
  }

  /**
   * Parse financials response
   */
  private parseFinancialsResponse(summary: any): FinancialData {
    const financialData = summary.financialData || {};
    const keyStats = summary.defaultKeyStatistics || {};
    const summaryDetail = summary.summaryDetail || {};

    return {
      keyFacts: {
        revenue: financialData.totalRevenue?.raw || 0,
        netIncome: financialData.netIncomeToCommon?.raw || 0,
        profitMargin: financialData.profitMargins?.raw || 0,
      },
      valuation: {
        peRatio: summaryDetail.trailingPE?.raw || 0,
        pbRatio: keyStats.priceToBook?.raw || 0,
        pegRatio: keyStats.pegRatio?.raw || 0,
      },
      growth: {
        revenueGrowth: financialData.revenueGrowth?.raw || 0,
        earningsGrowth: financialData.earningsGrowth?.raw || 0,
      },
      profitability: {
        roe: financialData.returnOnEquity?.raw || 0,
        roa: financialData.returnOnAssets?.raw || 0,
        operatingMargin: financialData.operatingMargins?.raw || 0,
      },
    };
  }

  /**
   * Get time range parameters for Yahoo Finance API
   */
  private getTimeRangeParams(range: TimeRange): { interval: string; period: string } {
    switch (range) {
      case "1D":
        return { interval: "5m", period: "1d" };
      case "1W":
        return { interval: "30m", period: "5d" };
      case "1M":
        return { interval: "1d", period: "1mo" };
      case "3M":
        return { interval: "1d", period: "3mo" };
      case "1Y":
        return { interval: "1d", period: "1y" };
      case "5Y":
        return { interval: "1wk", period: "5y" };
      case "Max":
        return { interval: "1mo", period: "max" };
      default:
        return { interval: "1d", period: "1y" };
    }
  }
}

// Export singleton instance
export const yahooFinanceService = new YahooFinanceService();
