/**
 * Unit tests for technical indicator calculations
 * Task 9.1 - Requirements: 5.2
 */

import { describe, it, expect } from "vitest";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  getRSISignal,
  getMACDSignal,
  getMASignal,
  getBollingerSignal,
  getOverallSentiment,
  Signal,
} from "../technical-indicators";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a simple ascending price series */
function ascending(n: number, start = 100, step = 1): number[] {
  return Array.from({ length: n }, (_, i) => start + i * step);
}

/** Generate a simple descending price series */
function descending(n: number, start = 200, step = 1): number[] {
  return Array.from({ length: n }, (_, i) => start - i * step);
}

/** Generate a flat price series */
function flat(n: number, value = 100): number[] {
  return Array.from({ length: n }, () => value);
}

// ---------------------------------------------------------------------------
// calculateSMA
// ---------------------------------------------------------------------------

describe("calculateSMA", () => {
  it("returns 0 for empty array", () => {
    expect(calculateSMA([], 10)).toBe(0);
  });

  it("returns last close when data < period", () => {
    expect(calculateSMA([10, 20, 30], 5)).toBe(30);
  });

  it("calculates correct SMA for exact period length", () => {
    // SMA of [10, 20, 30, 40, 50] with period 5 = 30
    expect(calculateSMA([10, 20, 30, 40, 50], 5)).toBe(30);
  });

  it("uses only the last `period` values", () => {
    // Last 3 of [1, 2, 3, 4, 5] = [3, 4, 5] → avg = 4
    expect(calculateSMA([1, 2, 3, 4, 5], 3)).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// calculateEMA
// ---------------------------------------------------------------------------

describe("calculateEMA", () => {
  it("returns 0 for empty array", () => {
    expect(calculateEMA([], 10)).toBe(0);
  });

  it("returns last close when data < period", () => {
    expect(calculateEMA([10, 20], 5)).toBe(20);
  });

  it("returns SMA when data length equals period", () => {
    const data = [10, 20, 30, 40, 50];
    // EMA seed = SMA = 30, no further data to smooth
    expect(calculateEMA(data, 5)).toBe(30);
  });

  it("applies exponential weighting for data beyond period", () => {
    const data = [10, 20, 30, 40, 50, 60];
    // SMA seed (period 5) = 30
    // multiplier = 2/6 = 1/3
    // EMA = (60 - 30) * (1/3) + 30 = 40
    expect(calculateEMA(data, 5)).toBeCloseTo(40, 5);
  });
});

// ---------------------------------------------------------------------------
// calculateRSI
// ---------------------------------------------------------------------------

describe("calculateRSI", () => {
  it("returns 50 when insufficient data", () => {
    expect(calculateRSI([100, 101], 14)).toBe(50);
  });

  it("returns 100 when all changes are gains", () => {
    // 16 ascending values → 15 positive changes, period 14
    const data = ascending(16, 100, 1);
    expect(calculateRSI(data, 14)).toBe(100);
  });

  it("returns close to 0 when all changes are losses", () => {
    // 16 descending values → 15 negative changes, period 14
    const data = descending(16, 200, 1);
    expect(calculateRSI(data, 14)).toBeLessThan(5);
  });

  it("returns ~50 for alternating equal gains and losses", () => {
    // Alternating +1 / -1 pattern
    const data: number[] = [100];
    for (let i = 1; i <= 30; i++) {
      data.push(data[i - 1] + (i % 2 === 0 ? -1 : 1));
    }
    const rsi = calculateRSI(data, 14);
    expect(rsi).toBeGreaterThan(40);
    expect(rsi).toBeLessThan(60);
  });

  it("returns value between 0 and 100", () => {
    const data = [100, 102, 99, 105, 103, 108, 106, 110, 107, 112, 109, 115, 111, 118, 114, 120];
    const rsi = calculateRSI(data, 14);
    expect(rsi).toBeGreaterThanOrEqual(0);
    expect(rsi).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// calculateMACD
// ---------------------------------------------------------------------------

describe("calculateMACD", () => {
  it("returns zeros when insufficient data", () => {
    const result = calculateMACD([100, 101, 102]);
    expect(result).toEqual({ value: 0, signal: 0, histogram: 0 });
  });

  it("returns non-zero values with sufficient data", () => {
    // 50 ascending values should produce a positive MACD
    const data = ascending(50, 100, 0.5);
    const result = calculateMACD(data);
    expect(result.value).not.toBe(0);
    expect(result.signal).not.toBe(0);
  });

  it("histogram equals value minus signal", () => {
    const data = ascending(60, 100, 0.3);
    const result = calculateMACD(data);
    expect(result.histogram).toBeCloseTo(result.value - result.signal, 10);
  });

  it("produces positive MACD for uptrending data", () => {
    const data = ascending(60, 100, 1);
    const result = calculateMACD(data);
    expect(result.value).toBeGreaterThan(0);
  });

  it("produces negative MACD for downtrending data", () => {
    const data = descending(60, 200, 1);
    const result = calculateMACD(data);
    expect(result.value).toBeLessThan(0);
  });
});

// ---------------------------------------------------------------------------
// calculateBollingerBands
// ---------------------------------------------------------------------------

describe("calculateBollingerBands", () => {
  it("returns zeros for empty array", () => {
    expect(calculateBollingerBands([])).toEqual({
      upper: 0,
      middle: 0,
      lower: 0,
    });
  });

  it("returns equal bands for flat data", () => {
    const data = flat(20, 100);
    const bb = calculateBollingerBands(data);
    expect(bb.middle).toBe(100);
    expect(bb.upper).toBe(100);
    expect(bb.lower).toBe(100);
  });

  it("upper > middle > lower for varying data", () => {
    const data = ascending(30, 90, 1);
    const bb = calculateBollingerBands(data);
    expect(bb.upper).toBeGreaterThan(bb.middle);
    expect(bb.middle).toBeGreaterThan(bb.lower);
  });

  it("bands are symmetric around middle", () => {
    const data = ascending(30, 90, 1);
    const bb = calculateBollingerBands(data);
    const upperDist = bb.upper - bb.middle;
    const lowerDist = bb.middle - bb.lower;
    expect(upperDist).toBeCloseTo(lowerDist, 10);
  });

  it("returns average when data < period", () => {
    const data = [10, 20, 30];
    const bb = calculateBollingerBands(data, 20);
    expect(bb.middle).toBe(20);
    expect(bb.upper).toBe(20);
    expect(bb.lower).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// Signal determination functions
// ---------------------------------------------------------------------------

describe("getRSISignal", () => {
  it("returns overpriced when RSI > 70", () => {
    expect(getRSISignal(75)).toBe("overpriced");
    expect(getRSISignal(100)).toBe("overpriced");
  });

  it("returns underpriced when RSI < 30", () => {
    expect(getRSISignal(25)).toBe("underpriced");
    expect(getRSISignal(0)).toBe("underpriced");
  });

  it("returns fair when RSI between 30 and 70", () => {
    expect(getRSISignal(50)).toBe("fair");
    expect(getRSISignal(30)).toBe("fair");
    expect(getRSISignal(70)).toBe("fair");
  });
});

describe("getMACDSignal", () => {
  it("returns underpriced for positive histogram", () => {
    expect(getMACDSignal(0.5)).toBe("underpriced");
  });

  it("returns overpriced for negative histogram", () => {
    expect(getMACDSignal(-0.5)).toBe("overpriced");
  });

  it("returns fair for near-zero histogram", () => {
    expect(getMACDSignal(0.005)).toBe("fair");
    expect(getMACDSignal(-0.005)).toBe("fair");
    expect(getMACDSignal(0)).toBe("fair");
  });
});

describe("getMASignal", () => {
  it("returns underpriced when price > MA", () => {
    expect(getMASignal(110, 100)).toBe("underpriced");
  });

  it("returns overpriced when price < MA", () => {
    expect(getMASignal(90, 100)).toBe("overpriced");
  });

  it("returns fair when price equals MA", () => {
    expect(getMASignal(100, 100)).toBe("fair");
  });

  it("returns fair when MA is 0", () => {
    expect(getMASignal(100, 0)).toBe("fair");
  });
});

describe("getBollingerSignal", () => {
  it("returns overpriced when price near upper band", () => {
    // upper=120, lower=80, bandwidth=40, threshold=4
    // price >= 120-4 = 116 → overpriced
    expect(getBollingerSignal(118, 120, 80)).toBe("overpriced");
  });

  it("returns underpriced when price near lower band", () => {
    // price <= 80+4 = 84 → underpriced
    expect(getBollingerSignal(82, 120, 80)).toBe("underpriced");
  });

  it("returns fair when price in middle zone", () => {
    expect(getBollingerSignal(100, 120, 80)).toBe("fair");
  });

  it("returns fair when bands are equal", () => {
    expect(getBollingerSignal(100, 100, 100)).toBe("fair");
  });
});

describe("getOverallSentiment", () => {
  it("returns overpriced when majority overpriced", () => {
    const signals: Signal[] = ["overpriced", "overpriced", "fair", "underpriced"];
    expect(getOverallSentiment(signals)).toBe("overpriced");
  });

  it("returns underpriced when majority underpriced", () => {
    const signals: Signal[] = ["underpriced", "underpriced", "underpriced", "fair"];
    expect(getOverallSentiment(signals)).toBe("underpriced");
  });

  it("returns fair when tied", () => {
    const signals: Signal[] = ["overpriced", "underpriced", "fair", "fair"];
    expect(getOverallSentiment(signals)).toBe("fair");
  });

  it("returns fair for all fair signals", () => {
    const signals: Signal[] = ["fair", "fair", "fair", "fair"];
    expect(getOverallSentiment(signals)).toBe("fair");
  });

  it("returns fair when overpriced and underpriced are tied", () => {
    const signals: Signal[] = ["overpriced", "underpriced", "overpriced", "underpriced"];
    // Both have 2, fair has 0 — neither > the other AND neither > fair(0)
    // overpriced(2) > underpriced(2) is false, so falls through to fair
    expect(getOverallSentiment(signals)).toBe("fair");
  });
});
