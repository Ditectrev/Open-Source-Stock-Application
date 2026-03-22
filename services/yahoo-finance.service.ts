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
  MarketIndex,
  TimeRange,
  TechnicalIndicators,
  ForecastData,
  SeasonalData,
} from "@/types";

export class YahooFinanceService {
  private baseUrl: string;
  private crumb: string | null = null;
  private cookie: string | null = null;
  private crumbExpiry: number = 0;

  constructor() {
    this.baseUrl = env.apis.yahooFinanceUrl;
  }

  /**
   * Get a valid crumb + cookie pair for authenticated Yahoo Finance endpoints.
   * Crumbs are cached for 30 minutes.
   */
  private async getCrumb(): Promise<{ crumb: string; cookie: string }> {
    if (this.crumb && this.cookie && Date.now() < this.crumbExpiry) {
      return { crumb: this.crumb, cookie: this.cookie };
    }

    try {
      // Step 1: hit the consent/finance page to get a session cookie
      const pageRes = await fetch("https://fc.yahoo.com", {
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      const setCookie = pageRes.headers.get("set-cookie") || "";
      const cookie = setCookie.split(";")[0]; // e.g. "A3=d=AQ..."

      // Step 2: use the cookie to fetch a crumb
      const crumbRes = await fetch(
        "https://query2.finance.yahoo.com/v1/test/getcrumb",
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Cookie: cookie,
          },
        }
      );

      if (!crumbRes.ok) {
        throw new Error(`Failed to fetch crumb: ${crumbRes.status}`);
      }

      const crumb = await crumbRes.text();

      this.crumb = crumb;
      this.cookie = cookie;
      this.crumbExpiry = Date.now() + 30 * 60 * 1000; // 30 min

      return { crumb, cookie };
    } catch (error) {
      logger.warn("Failed to obtain Yahoo Finance crumb, will try without auth", { error });
      return { crumb: "", cookie: "" };
    }
  }

  /**
   * Fetch from quoteSummary with crumb authentication
   */
  private async fetchQuoteSummary(symbol: string, modules: string): Promise<any> {
    const { crumb, cookie } = await getCrumbSafe(this);

    const url = crumb
      ? `${this.baseUrl}/v10/finance/quoteSummary/${symbol}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`
      : `${this.baseUrl}/v10/finance/quoteSummary/${symbol}?modules=${modules}`;

    const headers: Record<string, string> = {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0",
    };
    if (cookie) {
      headers["Cookie"] = cookie;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.quoteSummary?.result?.[0]) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    return data.quoteSummary.result[0];
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
   * Search for symbols by query string
   */
  async searchSymbols(query: string): Promise<Array<{ symbol: string; name: string; type: string; exchange: string }>> {
    return retryWithBackoff(
      async () => {
        try {
          const response = await fetch(
            `${this.baseUrl}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`,
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
          
          if (!data.quotes) {
            return [];
          }

          return data.quotes
            .filter((quote: any) => quote.symbol && quote.shortname)
            .map((quote: any) => ({
              symbol: quote.symbol,
              name: quote.shortname || quote.longname || quote.symbol,
              type: quote.quoteType || "EQUITY",
              exchange: quote.exchange || "",
            }));
        } catch (error) {
          logger.error("Failed to search symbols", error as Error, {
            query,
            baseUrl: this.baseUrl,
          });
          throw error;
        }
      },
      `YahooFinance:Search:${query}`
    );
  }

  /**
   * Fetch forecast/analyst data
   */
  async getForecastData(symbol: string): Promise<ForecastData> {
    return retryWithBackoff(
      async () => {
        try {
          const summary = await this.fetchQuoteSummary(
            symbol,
            "financialData,earningsTrend,recommendationTrend,earningsHistory"
          );
          return this.parseForecastResponse(summary);
        } catch (error) {
          logger.error("Failed to fetch forecast data", error as Error, {
            symbol,
            baseUrl: this.baseUrl,
          });
          throw error;
        }
      },
      `YahooFinance:Forecast:${symbol}`
    );
  }

  /**
   * Fetch financial statements
   */
  async getFinancials(symbol: string): Promise<FinancialData> {
    return retryWithBackoff(
      async () => {
        try {
          const summary = await this.fetchQuoteSummary(
            symbol,
            "financialData,defaultKeyStatistics,summaryDetail"
          );
          return this.parseFinancialsResponse(summary);
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
   * Fetch world market indices via Yahoo Finance quote endpoint.
   * Used as a fallback when CNN dataviz is unavailable.
   */
  /**
     * Fetch world market indices via Yahoo Finance quoteSummary endpoint.
     * Used as a fallback when CNN dataviz is unavailable.
     */
    async getWorldMarkets(): Promise<MarketIndex[]> {
      const indices: { symbol: string; name: string; region: MarketIndex["region"] }[] = [
        { symbol: "^GSPC", name: "S&P 500", region: "Americas" },
        { symbol: "^DJI", name: "Dow Jones", region: "Americas" },
        { symbol: "^IXIC", name: "NASDAQ", region: "Americas" },
        { symbol: "^N225", name: "Nikkei 225", region: "Asia-Pacific" },
        { symbol: "^HSI", name: "Hang Seng", region: "Asia-Pacific" },
        { symbol: "000001.SS", name: "Shanghai Composite", region: "Asia-Pacific" },
        { symbol: "^FTSE", name: "FTSE 100", region: "Europe" },
        { symbol: "^GDAXI", name: "DAX", region: "Europe" },
        { symbol: "^FCHI", name: "CAC 40", region: "Europe" },
      ];

      const results: MarketIndex[] = [];

      // Fetch each index using the authenticated quoteSummary endpoint
      const fetches = indices.map(async (idx) => {
        try {
          const summary = await this.fetchQuoteSummary(idx.symbol, "price");
          const price = summary.price || {};
          return {
            name: idx.name,
            symbol: idx.symbol,
            value: price.regularMarketPrice?.raw || 0,
            change: price.regularMarketChange?.raw || 0,
            changePercent: price.regularMarketChangePercent?.raw || 0,
            region: idx.region,
          };
        } catch (error) {
          logger.warn(`Failed to fetch index ${idx.symbol}, skipping`, {
            error: (error as Error).message,
          });
          return null;
        }
      });

      const settled = await Promise.all(fetches);
      for (const item of settled) {
        if (item) results.push(item);
      }

      if (results.length === 0) {
        throw new Error("Failed to fetch any world market indices from Yahoo Finance");
      }

      return results;
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
   * Parse forecast response from Yahoo Finance quoteSummary
   */
  private parseForecastResponse(summary: any): ForecastData {
    const financialData = summary.financialData || {};
    const recommendationTrend = summary.recommendationTrend?.trend?.[0] || {};
    const earningsTrend = summary.earningsTrend?.trend || [];
    const earningsHistory = summary.earningsHistory?.history || [];

    // Price targets from financialData
    const priceTargets = {
      low: financialData.targetLowPrice?.raw || 0,
      average: financialData.targetMeanPrice?.raw || 0,
      high: financialData.targetHighPrice?.raw || 0,
    };

    // Analyst ratings from recommendationTrend
    const analystRatings = {
      strongBuy: recommendationTrend.strongBuy || 0,
      buy: recommendationTrend.buy || 0,
      hold: recommendationTrend.hold || 0,
      sell: recommendationTrend.sell || 0,
      strongSell: recommendationTrend.strongSell || 0,
    };

    // EPS forecasts from earningsTrend (future) + earningsHistory (past)
    const epsForecasts: ForecastData["epsForecasts"] = [];

    // Add historical earnings with actuals
    for (const entry of earningsHistory) {
      const quarter = entry.quarter?.fmt || entry.period || "";
      if (!quarter) continue;
      const estimate = entry.epsEstimate?.raw;
      const actual = entry.epsActual?.raw;
      const surprise = entry.epsDifference?.raw;
      const surprisePercent = entry.surprisePercent?.raw != null
        ? entry.surprisePercent.raw * 100
        : undefined;

      epsForecasts.push({
        quarter,
        estimate: estimate ?? 0,
        ...(actual != null && { actual }),
        ...(surprise != null && { surprise }),
        ...(surprisePercent != null && { surprisePercent }),
      });
    }

    // Add future EPS estimates from earningsTrend
    for (const trend of earningsTrend) {
      const period = trend.period || "";
      if (!period) continue;
      // Skip if we already have this quarter from history
      if (epsForecasts.some((e) => e.quarter === period)) continue;
      const estimate = trend.earningsEstimate?.avg?.raw;
      if (estimate != null) {
        epsForecasts.push({ quarter: period, estimate });
      }
    }

    // Revenue forecasts from earningsTrend
    const revenueForecasts: ForecastData["revenueForecasts"] = [];
    for (const trend of earningsTrend) {
      const period = trend.period || "";
      if (!period) continue;
      const estimate = trend.revenueEstimate?.avg?.raw;
      if (estimate != null) {
        revenueForecasts.push({ quarter: period, estimate });
      }
    }

    return { priceTargets, analystRatings, epsForecasts, revenueForecasts };
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

// Helper to access private getCrumb from fetchQuoteSummary
async function getCrumbSafe(service: YahooFinanceService): Promise<{ crumb: string; cookie: string }> {
  return (service as any).getCrumb();
}

// Export singleton instance
export const yahooFinanceService = new YahooFinanceService();
