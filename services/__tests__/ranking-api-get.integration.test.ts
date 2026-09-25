/**
 * @vitest-environment node
 *
 * GET /api/market/ranking — mocks LLM output only; enrichment uses live services.
 */
import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(async () => ({
    id: "ranking-get-user",
    email: "ranking-get@test.local",
  })),
}));

vi.mock("@/services/subscription.service", () => ({
  subscriptionService: {
    getCurrentTier: vi.fn(async () => "LOCAL" as const),
  },
}));

vi.mock("@/services/ai-integration.service", () => {
  const etfPayload = {
    buyCandidates: [
      "SPY",
      "QQQ",
      "IWM",
      "VTI",
      "VOO",
      "SCHD",
      "XLF",
      "XLE",
    ].map((symbol) => ({
      symbol,
      name: symbol,
      thesis: `${symbol} etf thesis.`,
    })),
    sellCandidates: [
      "SPY",
      "QQQ",
      "IWM",
      "VTI",
      "VOO",
      "SCHD",
      "XLF",
      "XLE",
    ].map((symbol) => ({
      symbol,
      name: symbol,
      thesis: `${symbol} etf sell thesis.`,
    })),
  };
  const cryptoPayload = {
    buyCandidates: [
      "BTC-USD",
      "ETH-USD",
      "SOL-USD",
      "XRP-USD",
      "ADA-USD",
      "DOGE-USD",
      "AVAX-USD",
      "LINK-USD",
    ].map((symbol) => ({
      symbol,
      name: symbol,
      thesis: `${symbol} crypto thesis.`,
    })),
    sellCandidates: [
      "BTC-USD",
      "ETH-USD",
      "SOL-USD",
      "XRP-USD",
      "ADA-USD",
      "DOGE-USD",
      "AVAX-USD",
      "LINK-USD",
    ].map((symbol) => ({
      symbol,
      name: symbol,
      thesis: `${symbol} crypto sell thesis.`,
    })),
  };

  return {
    AIIntegrationService: class {
      lastPrompt = "";
      async setAIProvider() {}
      async runRawPrompt(prompt: string) {
        this.lastPrompt = prompt;
        const category = prompt.includes("US-listed ETFs")
          ? "etf"
          : prompt.includes("major cryptocurrencies")
            ? "crypto"
            : "stock";
        const payload =
          category === "etf"
            ? etfPayload
            : category === "crypto"
              ? cryptoPayload
              : etfPayload;
        return JSON.stringify(payload);
      }
    },
  };
});

async function getRanking(category: "etf" | "crypto") {
  const { GET } = await import("@/app/api/market/ranking/route");
  const request = new NextRequest(
    `http://localhost/api/market/ranking?timeframe=short&category=${category}`,
    {
      method: "GET",
      headers: { "x-ai-provider": "OLLAMA" },
    }
  );
  const response = await GET(request);
  const json = (await response.json()) as {
    success?: boolean;
    data?: { buy?: unknown[]; sell?: unknown[]; category?: string };
    error?: string;
  };
  return { status: response.status, json };
}

describe("GET /api/market/ranking", () => {
  it("returns ranked ETF rows for category=etf", async () => {
    const { status, json } = await getRanking("etf");
    expect(status).toBe(200);
    expect(json.data?.category).toBe("etf");
    expect(json.data?.buy?.length).toBeGreaterThanOrEqual(4);
    expect(json.data?.sell?.length).toBeGreaterThanOrEqual(4);
    console.log(
      `[ranking-api-proof] GET category=etf status=${status} buy=${json.data?.buy?.length} sell=${json.data?.sell?.length}`
    );
  });

  it("returns ranked crypto rows for category=crypto", async () => {
    const { status, json } = await getRanking("crypto");
    expect(status).toBe(200);
    expect(json.data?.category).toBe("crypto");
    expect(json.data?.buy?.length).toBeGreaterThanOrEqual(4);
    expect(json.data?.sell?.length).toBeGreaterThanOrEqual(4);
    console.log(
      `[ranking-api-proof] GET category=crypto status=${status} buy=${json.data?.buy?.length} sell=${json.data?.sell?.length}`
    );
  });
});
