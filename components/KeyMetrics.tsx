"use client";

/**
 * KeyMetrics Component
 * Displays key financial metrics with tooltips
 *
 * Requirements: 4.4, 4.5
 */

import { SymbolData } from "@/types";
import { useTheme } from "@/lib/theme-context";
import { useState } from "react";

export interface KeyMetricsProps {
  symbolData: SymbolData;
}

interface Metric {
  label: string;
  value: string;
  tooltip: string;
}

export function KeyMetrics({ symbolData }: KeyMetricsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Format large numbers
  const formatMarketCap = (value: number): string => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  const formatVolume = (value: number): string => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(0);
  };

  const metrics: Metric[] = [
    {
      label: "Market Cap",
      value: formatMarketCap(symbolData.marketCap),
      tooltip:
        "Market Capitalization is the total value of all outstanding shares. It's calculated by multiplying the current stock price by the total number of shares. This metric helps investors understand the company's size and compare it to others.",
    },
    {
      label: "Volume",
      value: formatVolume(symbolData.volume),
      tooltip:
        "Volume represents the total number of shares traded during a given period. Higher volume typically indicates more interest in the stock and can suggest stronger price movements. It's a key indicator of liquidity.",
    },
    {
      label: "52-Week High",
      value: `$${symbolData.fiftyTwoWeekHigh.toFixed(2)}`,
      tooltip:
        "The highest price the stock has reached in the past 52 weeks (one year). This helps investors understand the stock's recent peak performance and can indicate resistance levels.",
    },
    {
      label: "52-Week Low",
      value: `$${symbolData.fiftyTwoWeekLow.toFixed(2)}`,
      tooltip:
        "The lowest price the stock has reached in the past 52 weeks (one year). This helps investors understand the stock's recent bottom and can indicate support levels.",
    },
    {
      label: "52-Week Range",
      value: `$${symbolData.fiftyTwoWeekLow.toFixed(2)} - $${symbolData.fiftyTwoWeekHigh.toFixed(2)}`,
      tooltip:
        "The range between the lowest and highest prices over the past year. This shows the stock's volatility and price movement over time. A wider range indicates higher volatility.",
    },
  ];

  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h2
        className={`text-lg font-semibold mb-3 sm:mb-4 lg:mb-5 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Key Metrics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} isDark={isDark} />
        ))}
      </div>
    </div>
  );
}

interface MetricCardProps {
  metric: Metric;
  isDark: boolean;
}

function MetricCard({ metric, isDark }: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`relative p-3 sm:p-4 rounded-lg border ${
        isDark
          ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700"
          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
      } transition-colors`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div
            className={`text-xs sm:text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {metric.label}
          </div>
          <div
            className={`text-lg sm:text-xl font-bold mt-1 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {metric.value}
          </div>
        </div>
        <button
          type="button"
          aria-label={`More info about ${metric.label}`}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className={`ml-2 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
            }`}
        >
          ?
        </button>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className={`absolute z-10 w-64 p-3 rounded-lg shadow-lg text-sm ${
            isDark
              ? "bg-gray-900 text-gray-200 border border-gray-700"
              : "bg-white text-gray-700 border border-gray-200"
          }`}
          style={{
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "8px",
          }}
        >
          <div className="relative">
            {/* Arrow */}
            <div
              className={`absolute w-3 h-3 transform rotate-45 ${
                isDark
                  ? "bg-gray-900 border-l border-t border-gray-700"
                  : "bg-white border-l border-t border-gray-200"
              }`}
              style={{
                top: "-7px",
                left: "50%",
                marginLeft: "-6px",
              }}
            />
            <div className="relative">{metric.tooltip}</div>
          </div>
        </div>
      )}
    </div>
  );
}
