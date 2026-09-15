import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetMarketNews, mockGetCompanyNews, mockIsConfigured } = vi.hoisted(
  () => ({
    mockGetMarketNews: vi.fn(),
    mockGetCompanyNews: vi.fn(),
    mockIsConfigured: vi.fn(),
  })
);

vi.mock("@/services/yahoo-finance.service", () => ({
  yahooFinanceService: {
    getMarketNews: mockGetMarketNews,
    getCompanyNews: mockGetCompanyNews,
    getSymbolQuote: vi.fn(),
    getHistoricalData: vi.fn(),
    searchSymbols: vi.fn().mockResolvedValue([]),
    getFinancialStatements: vi.fn().mockResolvedValue({}),
    getAnalystForecasts: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/services/finnhub.service", () => ({
  finnhubService: {
    isConfigured: mockIsConfigured,
    getMarketNews: vi.fn(),
    getCompanyNews: vi.fn(),
    getSymbolQuote: vi.fn(),
    getHistoricalData: vi.fn(),
    searchSymbols: vi.fn().mockResolvedValue([]),
    getFinancialStatements: vi.fn().mockResolvedValue({}),
    getAnalystForecasts: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/services/cnn-api.service", () => ({
  cnnApiService: {
    getFearGreedIndex: vi.fn().mockResolvedValue({}),
    getWorldMarkets: vi.fn().mockResolvedValue([]),
    getEconomicEvents: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/services/trading-economics.service", () => ({
  tradingEconomicsService: {
    getEconomicEvents: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/env", () => ({
  env: {
    cache: {
      ttlSeconds: 300,
      rateLimitMaxRequests: 2,
      rateLimitWindowSeconds: 60,
    },
    apis: {
      yahooFinanceUrl: "https://query1.finance.yahoo.com",
      cnnDatavizUrl: "https://production.dataviz.cnn.io",
    },
  },
}));

import type { NewsArticle } from "@/lib/news";
import { cacheService } from "@/lib/cache";
import { rateLimiter } from "@/lib/rate-limiter";
import { MarketDataService } from "@/services/market-data.service";

function makeArticle(id: string, slug: string, symbol: string): NewsArticle {
  return {
    id,
    slug,
    title: `${symbol} headline`,
    summary: `${symbol} summary`,
    source: "Reuters",
    sourceUrl: `https://example.com/${slug}`,
    publishedAt: "2026-01-01T00:00:00.000Z",
    mentionedSymbols: [symbol],
  };
}

describe("MarketDataService news rate limiter", () => {
  let service: MarketDataService;

  beforeEach(() => {
    vi.clearAllMocks();
    cacheService.clear();
    rateLimiter.clearAll();
    mockIsConfigured.mockReturnValue(false);
    service = new MarketDataService();
  });

  it("shares one limiter bucket across company symbols", async () => {
    mockGetCompanyNews.mockResolvedValue([
      makeArticle("aapl-1", "aapl-story", "AAPL"),
    ]);

    await service.getMarketNews("AAPL");
    await expect(service.getMarketNews("MSFT")).rejects.toThrow(
      /rate limit exceeded/i
    );

    expect(mockGetCompanyNews).toHaveBeenCalledTimes(1);
    expect(mockGetCompanyNews).toHaveBeenCalledWith("AAPL");
    expect(rateLimiter.getStats()).toHaveProperty("news:upstream");
    expect(rateLimiter.getStats()).not.toHaveProperty("news:symbol:AAPL");
    expect(rateLimiter.getStats()).not.toHaveProperty("news:symbol:MSFT");
  });

  it("shares one limiter bucket between market and company news", async () => {
    mockGetMarketNews.mockResolvedValue([
      makeArticle("market-1", "market-story", "SPY"),
    ]);

    await service.getMarketNews();
    await expect(service.getMarketNews("TSLA")).rejects.toThrow(
      /rate limit exceeded/i
    );

    expect(mockGetMarketNews).toHaveBeenCalledTimes(1);
    expect(mockGetCompanyNews).not.toHaveBeenCalled();
    expect(rateLimiter.getStats()).toHaveProperty("news:upstream");
  });
});
