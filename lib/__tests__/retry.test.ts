import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { isRetryableFailure, retryWithBackoff } from "@/lib/retry";

describe("isRetryableFailure", () => {
  it("skips client HTTP errors that will not recover", () => {
    expect(
      isRetryableFailure(new Error("CNN API error: 418 Unknown Error"))
    ).toBe(false);
    expect(isRetryableFailure(new Error("Finnhub candles failed: 403"))).toBe(
      false
    );
  });

  it("retries rate limits, server errors, and unknown failures", () => {
    expect(isRetryableFailure(new Error("Finnhub quote failed: 429"))).toBe(
      true
    );
    expect(isRetryableFailure(new Error("Yahoo Finance API error: 503"))).toBe(
      true
    );
    expect(isRetryableFailure(new Error("network down"))).toBe(true);
  });
});

describe("retryWithBackoff", () => {
  it("does not sleep on HTTP 418", async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new Error("CNN API error: 418 Unknown Error"));

    await expect(retryWithBackoff(fn, "CNN:WorldMarkets")).rejects.toThrow(
      /418/
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
