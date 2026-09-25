/**
 * @vitest-environment node
 *
 * Exercises the real POST /api/market/ranking handler (local Ollama validation path)
 * with live enrichment — no mocked market-data services.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(async () => ({
    id: "ranking-integration-user",
    email: "ranking@test.local",
  })),
}));

vi.mock("@/services/subscription.service", () => ({
  subscriptionService: {
    getCurrentTier: vi.fn(async () => "LOCAL" as const),
  },
}));

const ETF_SYMBOLS = ["SPY", "QQQ", "IWM", "VTI", "VOO", "SCHD", "XLF", "XLE"];
const CRYPTO_SYMBOLS = [
  "BTC-USD",
  "ETH-USD",
  "SOL-USD",
  "XRP-USD",
  "ADA-USD",
  "DOGE-USD",
  "AVAX-USD",
  "LINK-USD",
];
const STOCK_SYMBOLS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "GOOGL",
  "AMZN",
  "META",
  "TSLA",
  "JPM",
];

function candidates(symbols: string[]) {
  return symbols.map((symbol) => ({
    symbol,
    name: symbol,
    thesis: `Integration test candidate for ${symbol}.`,
  }));
}

async function postRanking(
  category: "etf" | "crypto" | "stock",
  symbols: string[]
) {
  const { POST } = await import("@/app/api/market/ranking/route");
  const list = candidates(symbols);
  const request = new NextRequest("http://localhost/api/market/ranking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ai-provider": "OLLAMA",
    },
    body: JSON.stringify({
      timeframe: "short",
      category,
      buyCandidates: list,
      sellCandidates: list,
    }),
  });

  const response = await POST(request);
  const json = (await response.json()) as {
    success?: boolean;
    data?: { buy?: unknown[]; sell?: unknown[]; category?: string };
    error?: string;
  };

  return { status: response.status, json };
}

describe("POST /api/market/ranking enrichment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ranked ETF buy/sell rows", async () => {
    const { status, json } = await postRanking("etf", ETF_SYMBOLS);
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.category).toBe("etf");
    expect(json.data?.buy?.length).toBeGreaterThanOrEqual(4);
    expect(json.data?.sell?.length).toBeGreaterThanOrEqual(4);
    console.log(
      `[ranking-api-proof] POST category=etf status=${status} buy=${json.data?.buy?.length} sell=${json.data?.sell?.length}`
    );
  });

  it("returns ranked crypto buy/sell rows", async () => {
    const { status, json } = await postRanking("crypto", CRYPTO_SYMBOLS);
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.category).toBe("crypto");
    expect(json.data?.buy?.length).toBeGreaterThanOrEqual(4);
    expect(json.data?.sell?.length).toBeGreaterThanOrEqual(4);
    console.log(
      `[ranking-api-proof] POST category=crypto status=${status} buy=${json.data?.buy?.length} sell=${json.data?.sell?.length}`
    );
  });

  it("returns ranked stock buy/sell rows", async () => {
    const { status, json } = await postRanking("stock", STOCK_SYMBOLS);
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.category).toBe("stock");
    expect(json.data?.buy?.length).toBeGreaterThanOrEqual(4);
    expect(json.data?.sell?.length).toBeGreaterThanOrEqual(4);
    console.log(
      `[ranking-api-proof] POST category=stock status=${status} buy=${json.data?.buy?.length} sell=${json.data?.sell?.length}`
    );
  });
});
