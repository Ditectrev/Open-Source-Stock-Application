import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  fetchPrimarySymbolData,
  fetchSecondarySymbolData,
} from "@/lib/home-page-symbol-fetch";

describe("home-page-symbol-fetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches primary symbol and historical data in parallel", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { symbol: "AAPL", name: "Apple" } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              timestamp: "2024-01-01",
              open: 1,
              high: 2,
              low: 0.5,
              close: 1.5,
              volume: 10,
            },
          ],
        }),
      } as Response);

    const result = await fetchPrimarySymbolData("AAPL", "1M");

    expect(result.symbolData.symbol).toBe("AAPL");
    expect(result.historicalData).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("requests suffixed listings without a dot in the API path", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { symbol: "SAP.DE", name: "SAP" } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      } as Response);

    await fetchPrimarySymbolData("SAP.DE", "1Y");

    expect(fetch).toHaveBeenNthCalledWith(1, "/api/market/symbol/SAP__dot__DE");
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/market/historical/SAP__dot__DE?range=1Y"
    );
  });

  it("returns partial secondary data when some endpoints fail", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { rsi: { value: 50, signal: "fair" } } }),
      } as Response)
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { revenue: [] } }),
      } as Response);

    const result = await fetchSecondarySymbolData("AAPL");

    expect(result.technicalIndicators).toEqual({
      rsi: { value: 50, signal: "fair" },
    });
    expect(result.forecastData).toBeNull();
    expect(result.seasonalData).toBeNull();
    expect(result.financialData).toEqual({ revenue: [] });
  });
});
