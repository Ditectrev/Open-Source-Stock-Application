"use client";

/**
 * TechnicalIndicatorsDisplay Component
 * Displays technical indicators with tooltips, color coding, and overall sentiment gauge.
 * Uses "overpriced", "underpriced", "fairly priced" language — never "Buy" or "Sell".
 *
 * Requirements: 5.1, 5.3, 5.4, 5.5, 5.6
 */

import { TechnicalIndicators } from "@/types";
import { useTheme } from "@/lib/theme-context";
import { useState } from "react";

export interface TechnicalIndicatorsDisplayProps {
  indicators: TechnicalIndicators | null | undefined;
}

type Signal = "overpriced" | "underpriced" | "fair";

interface IndicatorCardData {
  name: string;
  tooltip: string;
  signal: Signal;
  values: { label: string; value: string }[];
}

const SIGNAL_LABELS: Record<Signal, string> = {
  overpriced: "Overpriced",
  underpriced: "Underpriced",
  fair: "Fairly Priced",
};

const SENTIMENT_LABELS: Record<Signal, string> = {
  overpriced: "Overall: Appears Overpriced",
  underpriced: "Overall: Appears Underpriced",
  fair: "Overall: Appears Fairly Priced",
};

function getSignalColors(signal: Signal, isDark: boolean) {
  switch (signal) {
    case "overpriced":
      return {
        badge: isDark ? "bg-red-900/60 text-red-300" : "bg-red-100 text-red-700",
        border: isDark ? "border-red-700" : "border-red-300",
        dot: "bg-red-500",
      };
    case "underpriced":
      return {
        badge: isDark ? "bg-green-900/60 text-green-300" : "bg-green-100 text-green-700",
        border: isDark ? "border-green-700" : "border-green-300",
        dot: "bg-green-500",
      };
    case "fair":
    default:
      return {
        badge: isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600",
        border: isDark ? "border-gray-600" : "border-gray-300",
        dot: "bg-gray-400",
      };
  }
}

function buildIndicatorCards(indicators: TechnicalIndicators): IndicatorCardData[] {
  return [
    {
      name: "RSI (Relative Strength Index)",
      tooltip:
        "RSI measures the speed and magnitude of recent price changes on a scale of 0 to 100. Values above 70 may suggest the asset is overpriced, while values below 30 may suggest it is underpriced.",
      signal: indicators.rsi.signal,
      values: [{ label: "RSI", value: indicators.rsi.value.toFixed(2) }],
    },
    {
      name: "MACD",
      tooltip:
        "Moving Average Convergence Divergence tracks the relationship between two moving averages of price. A positive histogram may suggest upward momentum, while a negative histogram may suggest downward momentum.",
      signal: indicators.macd.trend,
      values: [
        { label: "MACD", value: indicators.macd.value.toFixed(4) },
        { label: "Signal", value: indicators.macd.signal.toFixed(4) },
        { label: "Histogram", value: indicators.macd.histogram.toFixed(4) },
      ],
    },
    {
      name: "Moving Averages",
      tooltip:
        "Moving averages smooth out price data over a period. When the 50-day average is above the 200-day average, it may suggest an upward trend. When below, it may suggest a downward trend.",
      signal: indicators.movingAverages.signal,
      values: [
        { label: "MA 50", value: indicators.movingAverages.ma50.toFixed(2) },
        { label: "MA 200", value: indicators.movingAverages.ma200.toFixed(2) },
      ],
    },
    {
      name: "Bollinger Bands",
      tooltip:
        "Bollinger Bands consist of a middle band (moving average) with upper and lower bands based on standard deviation. Prices near the upper band may indicate the asset is overpriced, while prices near the lower band may indicate it is underpriced.",
      signal: indicators.bollingerBands.signal,
      values: [
        { label: "Upper", value: indicators.bollingerBands.upper.toFixed(2) },
        { label: "Middle", value: indicators.bollingerBands.middle.toFixed(2) },
        { label: "Lower", value: indicators.bollingerBands.lower.toFixed(2) },
      ],
    },
  ];
}

export function TechnicalIndicatorsDisplay({ indicators }: TechnicalIndicatorsDisplayProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!indicators) {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
      >
        <h2
          className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Technical Indicators
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-24 rounded-lg animate-pulse ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  const cards = buildIndicatorCards(indicators);
  const sentimentColors = getSignalColors(indicators.overallSentiment, isDark);

  return (
    <div
      className={`p-6 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
    >
      <h2
        className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
      >
        Technical Indicators
      </h2>

      {/* Overall Sentiment Gauge */}
      <div
        data-testid="sentiment-gauge"
        className={`mb-6 p-4 rounded-lg border-2 ${sentimentColors.border} ${
          isDark ? "bg-gray-700/30" : "bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${sentimentColors.dot}`} />
          <span
            className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {SENTIMENT_LABELS[indicators.overallSentiment]}
          </span>
          <span
            className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${sentimentColors.badge}`}
          >
            {SIGNAL_LABELS[indicators.overallSentiment]}
          </span>
        </div>
      </div>

      {/* Indicator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <IndicatorCard key={card.name} card={card} isDark={isDark} />
        ))}
      </div>
    </div>
  );
}

interface IndicatorCardProps {
  card: IndicatorCardData;
  isDark: boolean;
}

function IndicatorCard({ card, isDark }: IndicatorCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = getSignalColors(card.signal, isDark);

  return (
    <div
      className={`relative p-4 rounded-lg border ${
        isDark
          ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700"
          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
      } transition-colors`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="relative flex items-center gap-2 cursor-help"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span
            className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            {card.name}
          </span>
          <span
            className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
            }`}
          >
            ?
          </span>

          {/* Tooltip — positioned relative to the name row */}
          {showTooltip && (
            <div
              className={`absolute z-10 w-64 p-3 rounded-lg shadow-lg text-sm ${
                isDark
                  ? "bg-gray-900 text-gray-200 border border-gray-700"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
              style={{ top: "calc(100% + 6px)", left: 0 }}
            >
              {card.tooltip}
            </div>
          )}
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}
        >
          {SIGNAL_LABELS[card.signal]}
        </span>
      </div>

      <div className="space-y-1">
        {card.values.map((v) => (
          <div key={v.label} className="flex justify-between items-center">
            <span
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {v.label}
            </span>
            <span
              className={`text-sm font-mono font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {v.value}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
