/**
 * Technical Indicator Calculations
 * Pure functions that operate on number arrays (close prices)
 * Used by MarketDataService for indicator signal determination
 *
 * Task 9.1 - Requirements: 5.2
 */

export type Signal = "overpriced" | "underpriced" | "fair";

/**
 * Calculate Simple Moving Average from close prices.
 * Returns the SMA value for the most recent `period` data points.
 * Returns the last close price if insufficient data.
 */
export function calculateSMA(closes: number[], period: number): number {
  if (closes.length === 0) return 0;
  if (closes.length < period) return closes[closes.length - 1];
  const slice = closes.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

/**
 * Calculate Exponential Moving Average from close prices.
 * Returns the final EMA value.
 * Uses SMA as the seed for the first EMA value.
 */
export function calculateEMA(closes: number[], period: number): number {
  if (closes.length === 0) return 0;
  if (closes.length < period) return closes[closes.length - 1];

  const multiplier = 2 / (period + 1);

  // Seed with SMA of first `period` values
  let ema = closes.slice(0, period).reduce((sum, v) => sum + v, 0) / period;

  for (let i = period; i < closes.length; i++) {
    ema = (closes[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculate RSI (Relative Strength Index) using Wilder's smoothing method.
 * Returns the most recent RSI value.
 * Default period is 14.
 */
export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50; // neutral when insufficient data

  // Initial average gain/loss over the first `period` changes
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }

  avgGain /= period;
  avgLoss /= period;

  // Wilder's smoothing for remaining data points
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Calculate MACD (Moving Average Convergence Divergence).
 * Returns { value, signal, histogram } for the most recent data point.
 * Standard parameters: 12-period EMA, 26-period EMA, 9-period signal.
 */
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { value: number; signal: number; histogram: number } {
  // Need at least slowPeriod + signalPeriod data points for a meaningful MACD
  if (closes.length < slowPeriod + signalPeriod) {
    return { value: 0, signal: 0, histogram: 0 };
  }

  // Calculate EMA series for fast and slow
  const fastMultiplier = 2 / (fastPeriod + 1);
  const slowMultiplier = 2 / (slowPeriod + 1);

  // Seed fast EMA
  let fastEma =
    closes.slice(0, fastPeriod).reduce((s, v) => s + v, 0) / fastPeriod;
  // Seed slow EMA
  let slowEma =
    closes.slice(0, slowPeriod).reduce((s, v) => s + v, 0) / slowPeriod;

  // Build MACD line values starting from slowPeriod index
  // First, advance fast EMA to slowPeriod position
  for (let i = fastPeriod; i < slowPeriod; i++) {
    fastEma = (closes[i] - fastEma) * fastMultiplier + fastEma;
  }

  const macdLine: number[] = [];
  macdLine.push(fastEma - slowEma);

  for (let i = slowPeriod; i < closes.length; i++) {
    fastEma = (closes[i] - fastEma) * fastMultiplier + fastEma;
    slowEma = (closes[i] - slowEma) * slowMultiplier + slowEma;
    macdLine.push(fastEma - slowEma);
  }

  // Calculate signal line (EMA of MACD line)
  if (macdLine.length < signalPeriod) {
    const lastMacd = macdLine[macdLine.length - 1];
    return { value: lastMacd, signal: 0, histogram: lastMacd };
  }

  const signalMultiplier = 2 / (signalPeriod + 1);
  let signalEma =
    macdLine.slice(0, signalPeriod).reduce((s, v) => s + v, 0) / signalPeriod;

  for (let i = signalPeriod; i < macdLine.length; i++) {
    signalEma = (macdLine[i] - signalEma) * signalMultiplier + signalEma;
  }

  const lastMacd = macdLine[macdLine.length - 1];
  const histogram = lastMacd - signalEma;

  return { value: lastMacd, signal: signalEma, histogram };
}

/**
 * Calculate Bollinger Bands.
 * Returns { upper, middle, lower } for the most recent data point.
 * Default: 20-period SMA with 2 standard deviations.
 */
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number; middle: number; lower: number } {
  if (closes.length === 0) return { upper: 0, middle: 0, lower: 0 };
  if (closes.length < period) {
    const avg = closes.reduce((s, v) => s + v, 0) / closes.length;
    return { upper: avg, middle: avg, lower: avg };
  }

  const slice = closes.slice(-period);
  const middle = slice.reduce((s, v) => s + v, 0) / period;

  const variance =
    slice.reduce((sum, val) => sum + (val - middle) ** 2, 0) / period;
  const sd = Math.sqrt(variance);

  return {
    upper: middle + stdDevMultiplier * sd,
    middle,
    lower: middle - stdDevMultiplier * sd,
  };
}

/**
 * Determine RSI signal.
 * RSI > 70 = overpriced, RSI < 30 = underpriced, else fair.
 */
export function getRSISignal(rsi: number): Signal {
  if (rsi > 70) return "overpriced";
  if (rsi < 30) return "underpriced";
  return "fair";
}

/**
 * Determine MACD signal from histogram.
 * histogram > 0 = underpriced (bullish), < 0 = overpriced (bearish).
 * Near zero (within threshold) = fair.
 */
export function getMACDSignal(
  histogram: number,
  threshold: number = 0.01
): Signal {
  if (histogram > threshold) return "underpriced";
  if (histogram < -threshold) return "overpriced";
  return "fair";
}

/**
 * Determine Moving Average signal.
 * price > MA = underpriced (bullish), price < MA = overpriced (bearish).
 * Compares current price against the 50-day MA.
 */
export function getMASignal(currentPrice: number, ma50: number): Signal {
  if (ma50 === 0) return "fair";
  if (currentPrice > ma50) return "underpriced";
  if (currentPrice < ma50) return "overpriced";
  return "fair";
}

/**
 * Determine Bollinger Bands signal.
 * Price near upper band = overpriced, near lower band = underpriced, middle = fair.
 * "Near" is defined as within 10% of the band width from the band.
 */
export function getBollingerSignal(
  currentPrice: number,
  upper: number,
  lower: number
): Signal {
  if (upper === lower) return "fair";
  const bandWidth = upper - lower;
  const nearThreshold = bandWidth * 0.1;

  if (currentPrice >= upper - nearThreshold) return "overpriced";
  if (currentPrice <= lower + nearThreshold) return "underpriced";
  return "fair";
}

/**
 * Determine overall sentiment from individual signals.
 * Uses majority vote: whichever signal appears most wins.
 */
export function getOverallSentiment(signals: Signal[]): Signal {
  const counts: Record<Signal, number> = {
    overpriced: 0,
    underpriced: 0,
    fair: 0,
  };

  for (const s of signals) {
    counts[s]++;
  }

  if (counts.overpriced > counts.underpriced && counts.overpriced > counts.fair)
    return "overpriced";
  if (
    counts.underpriced > counts.overpriced &&
    counts.underpriced > counts.fair
  )
    return "underpriced";
  return "fair";
}
