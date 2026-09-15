import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@/services/market-data.service", () => ({
  marketDataService: {
    getMarketNews: vi.fn(),
  },
}));

import { marketDataService } from "@/services/market-data.service";

describe("GET /api/market/news", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns market news", async () => {
    vi.mocked(marketDataService.getMarketNews).mockResolvedValue([
      {
        id: "1",
        slug: "fh-1",
        title: "McDonald's beats",
        summary: "Sales rose.",
        source: "Reuters",
        sourceUrl: "https://example.com/mcd",
        publishedAt: "2024-01-15T12:00:00.000Z",
        mentionedSymbols: ["MCD"],
      },
    ]);

    const response = await GET(
      new NextRequest("http://localhost:3000/api/market/news")
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data[0].mentionedSymbols).toEqual(["MCD"]);
    expect(marketDataService.getMarketNews).toHaveBeenCalledWith(null);
  });

  it("rejects invalid symbols", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/api/market/news?symbol=nope!!")
    );
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
