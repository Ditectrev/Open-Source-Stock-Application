import { describe, expect, it } from "vitest";
import {
  formatQuoteChange,
  formatQuoteCompact,
  formatQuotePrice,
  quoteMajorCurrency,
} from "@/lib/quote-money";

describe("quote money", () => {
  it("formats US prices in dollars and foreign prices in the listing currency", () => {
    expect(formatQuotePrice(150.25)).toBe("$150.25");
    expect(formatQuotePrice(199.22, "EUR")).toBe("€199.22");
    expect(formatQuotePrice(2450, "JPY")).toBe("¥2,450");
    expect(formatQuotePrice(73.4, "GBp")).toBe("73.40 GBX");
    expect(formatQuotePrice(73.4, "GBX")).toBe("73.40 GBX");
    expect(formatQuoteChange(1.2, "GBp")).toBe("+1.20 GBX");
    expect(formatQuoteChange(-2.03, "EUR")).toBe("-€2.03");
    expect(formatQuoteChange(0, "USD")).toBe("+$0.00");
    expect(formatQuoteCompact(229_940_576_256, "EUR")).toBe("€229.94B");
    expect(formatQuoteCompact(2_500_000_000_000)).toBe("$2.50T");
    expect(formatQuoteCompact(23_000_000_000, "GBp")).toBe("£23.00B");
    expect(quoteMajorCurrency("GBp")).toBe("GBP");
    expect(quoteMajorCurrency("EUR")).toBe("EUR");
  });
});
