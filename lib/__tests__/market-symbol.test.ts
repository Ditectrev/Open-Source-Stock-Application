import { describe, expect, it } from "vitest";
import {
  decodeMarketSymbolParam,
  isValidMarketSymbol,
  marketSymbolPathSegment,
  normalizeMarketSymbol,
  readMarketSymbolParam,
  rewriteDottedMarketSymbolPath,
} from "@/lib/market-symbol";

describe("market-symbol", () => {
  it("normalizes valid symbols", () => {
    expect(normalizeMarketSymbol(" aapl ")).toBe("AAPL");
    expect(normalizeMarketSymbol("brk.b")).toBe("BRK.B");
  });

  it("rejects empty or invalid symbols", () => {
    expect(normalizeMarketSymbol("")).toBeNull();
    expect(normalizeMarketSymbol("   ")).toBeNull();
    expect(normalizeMarketSymbol(null)).toBeNull();
    expect(normalizeMarketSymbol("AAPL;DROP")).toBeNull();
    expect(normalizeMarketSymbol("../etc")).toBeNull();
  });

  it("validates symbol pattern", () => {
    expect(isValidMarketSymbol("AAPL")).toBe(true);
    expect(isValidMarketSymbol("SAP.DE")).toBe(true);
    expect(isValidMarketSymbol("BRK.B")).toBe(true);
    expect(isValidMarketSymbol("")).toBe(false);
  });

  it("keeps exchange suffixes in a Next-safe path and restores them", async () => {
    expect(marketSymbolPathSegment("sap.de")).toBe("SAP__dot__DE");
    expect(marketSymbolPathSegment("BRK.B")).toBe("BRK__dot__B");
    expect(marketSymbolPathSegment("AAPL")).toBe("AAPL");
    expect(decodeMarketSymbolParam("SAP__dot__DE")).toBe("SAP.DE");
    expect(
      await readMarketSymbolParam(Promise.resolve({ symbol: "VOD__dot__L" }))
    ).toBe("VOD.L");
    expect(
      await readMarketSymbolParam(Promise.resolve({ symbol: "SAP.DE" }))
    ).toBe("SAP.DE");
  });

  it("rewrites dotted market API paths and leaves plain tickers alone", () => {
    expect(rewriteDottedMarketSymbolPath("/api/market/symbol/SAP.DE")).toBe(
      "/api/market/symbol/SAP__dot__DE"
    );
    expect(rewriteDottedMarketSymbolPath("/api/market/historical/7203.T")).toBe(
      "/api/market/historical/7203__dot__T"
    );
    expect(
      rewriteDottedMarketSymbolPath("/api/market/ai-prediction/VOD.L/snapshot")
    ).toBe("/api/market/ai-prediction/VOD__dot__L/snapshot");
    expect(rewriteDottedMarketSymbolPath("/api/market/symbol/AAPL")).toBeNull();
    expect(rewriteDottedMarketSymbolPath("/api/market/search")).toBeNull();
  });
});
