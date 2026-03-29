"use client";

/**
 * ForecastDisplay Component
 * Displays analyst price targets, rating distribution, EPS and revenue forecasts
 * with tooltips, color-coded earnings surprises, and visual indicators.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { ForecastData } from "@/types";
import { useTheme } from "@/lib/theme-context";
import { useState } from "react";

export interface ForecastDisplayProps {
  forecast: ForecastData | null | undefined;
}

interface TooltipTriggerProps {
  label: string;
  tooltip: string;
  isDark: boolean;
}

const FORECAST_TOOLTIPS: Record<string, string> = {
  priceTargets:
    "Analyst price targets represent the range of prices that analysts expect the stock to reach. The low, average, and high values show the spread of analyst opinions.",
  analystRatings:
    "Analyst ratings show the distribution of recommendations from financial analysts covering this stock, ranging from Strong Buy to Strong Sell.",
  eps: "Earnings Per Share (EPS) forecasts compare analyst estimates with actual reported earnings. A positive surprise means the company earned more than expected.",
  revenue:
    "Revenue forecasts compare analyst estimates with actual reported revenue. Comparing actuals to estimates helps gauge company performance against expectations.",
};

const RATING_LABELS = [
  "Strong Buy",
  "Buy",
  "Hold",
  "Sell",
  "Strong Sell",
] as const;
const RATING_KEYS: Array<keyof ForecastData["analystRatings"]> = [
  "strongBuy",
  "buy",
  "hold",
  "sell",
  "strongSell",
];

function getRatingBarColor(index: number, isDark: boolean): string {
  const colors = [
    isDark ? "bg-green-500" : "bg-green-600",
    isDark ? "bg-green-400" : "bg-green-400",
    isDark ? "bg-yellow-400" : "bg-yellow-500",
    isDark ? "bg-red-400" : "bg-red-400",
    isDark ? "bg-red-500" : "bg-red-600",
  ];
  return colors[index];
}

function TooltipTrigger({ label, tooltip, isDark }: TooltipTriggerProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex items-center gap-2">
      <h3
        className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {label}
      </h3>
      <button
        type="button"
        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs cursor-help
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
          }`}
        aria-label={`More info about ${label}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        ?
      </button>
      {showTooltip && (
        <div
          role="tooltip"
          className={`absolute z-10 w-64 p-3 rounded-lg shadow-lg text-sm ${
            isDark
              ? "bg-gray-900 text-gray-200 border border-gray-700"
              : "bg-white text-gray-700 border border-gray-200"
          }`}
          style={{ top: "calc(100% + 6px)", left: 0 }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  return `$${value.toFixed(2)}`;
}

function SurpriseIndicator({
  surprise,
  surprisePercent,
  isDark,
}: {
  surprise: number;
  surprisePercent?: number;
  isDark: boolean;
}) {
  const isBeat = surprise > 0;
  const colorClass = isBeat
    ? isDark
      ? "text-green-400"
      : "text-green-600"
    : isDark
      ? "text-red-400"
      : "text-red-600";
  const bgClass = isBeat
    ? isDark
      ? "bg-green-900/30"
      : "bg-green-50"
    : isDark
      ? "bg-red-900/30"
      : "bg-red-50";
  const label = isBeat ? "Beat" : "Missed";
  const icon = isBeat ? "▲" : "▼";

  return (
    <span
      data-testid={isBeat ? "earnings-beat" : "earnings-miss"}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colorClass} ${bgClass}`}
    >
      {icon} {label}
      {surprisePercent !== undefined &&
        ` (${surprisePercent > 0 ? "+" : ""}${surprisePercent.toFixed(2)}%)`}
    </span>
  );
}

function PriceTargetRange({
  low,
  average,
  high,
  isDark,
}: {
  low: number;
  average: number;
  high: number;
  isDark: boolean;
}) {
  const range = high - low;
  const avgPosition = range > 0 ? ((average - low) / range) * 100 : 50;

  return (
    <div className="mt-3">
      <div className="flex justify-between mb-1">
        <span
          className={`text-xs ${isDark ? "text-gray-300" : "text-gray-500"}`}
        >
          Low: ${low.toFixed(2)}
        </span>
        <span
          className={`text-xs font-medium ${isDark ? "text-blue-400" : "text-blue-600"}`}
        >
          Avg: ${average.toFixed(2)}
        </span>
        <span
          className={`text-xs ${isDark ? "text-gray-300" : "text-gray-500"}`}
        >
          High: ${high.toFixed(2)}
        </span>
      </div>
      <div
        data-testid="price-target-range"
        className={`relative h-3 rounded-full ${isDark ? "bg-gray-600" : "bg-gray-200"}`}
      >
        <div
          className={`absolute h-3 rounded-full ${isDark ? "bg-blue-700" : "bg-blue-200"}`}
          style={{ left: "0%", width: "100%" }}
        />
        <div
          data-testid="price-target-marker"
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow"
          style={{
            left: `${avgPosition}%`,
            transform: `translateX(-50%) translateY(-50%)`,
          }}
        />
      </div>
    </div>
  );
}

export function ForecastDisplay({ forecast }: ForecastDisplayProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!forecast) {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
      >
        <h2
          className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Forecast Data
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

  const totalRatings = RATING_KEYS.reduce(
    (sum, key) => sum + forecast.analystRatings[key],
    0
  );

  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
      role="region"
      aria-label="Forecast Data"
    >
      <h2
        className={`text-lg font-semibold mb-4 sm:mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
      >
        Forecast Data
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Price Targets Card */}
        <div
          className={`p-4 rounded-lg border ${
            isDark
              ? "bg-gray-700/50 border-gray-600"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <TooltipTrigger
            label="Price Targets"
            tooltip={FORECAST_TOOLTIPS.priceTargets}
            isDark={isDark}
          />
          <div className="mt-3 space-y-2">
            <div className="flex justify-between">
              <span
                className={`text-sm ${isDark ? "text-gray-300" : "text-gray-500"}`}
              >
                Low
              </span>
              <span
                className={`text-sm font-mono font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                ${forecast.priceTargets.low.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className={`text-sm ${isDark ? "text-gray-300" : "text-gray-500"}`}
              >
                Average
              </span>
              <span
                className={`text-sm font-mono font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}
              >
                ${forecast.priceTargets.average.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className={`text-sm ${isDark ? "text-gray-300" : "text-gray-500"}`}
              >
                High
              </span>
              <span
                className={`text-sm font-mono font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                ${forecast.priceTargets.high.toFixed(2)}
              </span>
            </div>
          </div>
          <PriceTargetRange
            low={forecast.priceTargets.low}
            average={forecast.priceTargets.average}
            high={forecast.priceTargets.high}
            isDark={isDark}
          />
        </div>

        {/* Analyst Ratings Card */}
        <div
          className={`p-4 rounded-lg border ${
            isDark
              ? "bg-gray-700/50 border-gray-600"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <TooltipTrigger
            label="Analyst Ratings"
            tooltip={FORECAST_TOOLTIPS.analystRatings}
            isDark={isDark}
          />
          <div className="mt-3 space-y-2">
            {RATING_LABELS.map((label, index) => {
              const count = forecast.analystRatings[RATING_KEYS[index]];
              const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              return (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={`text-xs w-20 shrink-0 ${isDark ? "text-gray-300" : "text-gray-500"}`}
                  >
                    {label}
                  </span>
                  <div
                    className={`flex-1 h-4 rounded-full overflow-hidden ${
                      isDark ? "bg-gray-600" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full ${getRatingBarColor(index, isDark)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-mono w-6 text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* EPS Forecasts Card */}
        <div
          className={`p-4 rounded-lg border ${
            isDark
              ? "bg-gray-700/50 border-gray-600"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <TooltipTrigger
            label="EPS Forecasts"
            tooltip={FORECAST_TOOLTIPS.eps}
            isDark={isDark}
          />
          <div className="mt-3 space-y-3">
            {forecast.epsForecasts.map((eps) => (
              <div
                key={eps.quarter}
                className={`flex items-center justify-between py-1 border-b last:border-b-0 ${
                  isDark ? "border-gray-600" : "border-gray-200"
                }`}
              >
                <span
                  className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  {eps.quarter}
                </span>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div
                      className={`text-xs ${isDark ? "text-gray-300" : "text-gray-500"}`}
                    >
                      Est: ${eps.estimate.toFixed(2)}
                    </div>
                    {eps.actual !== undefined && (
                      <div
                        className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        Act: ${eps.actual.toFixed(2)}
                      </div>
                    )}
                  </div>
                  {eps.surprise !== undefined && eps.surprise !== 0 && (
                    <SurpriseIndicator
                      surprise={eps.surprise}
                      surprisePercent={eps.surprisePercent}
                      isDark={isDark}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Forecasts Card */}
        <div
          className={`p-4 rounded-lg border ${
            isDark
              ? "bg-gray-700/50 border-gray-600"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <TooltipTrigger
            label="Revenue Forecasts"
            tooltip={FORECAST_TOOLTIPS.revenue}
            isDark={isDark}
          />
          <div className="mt-3 space-y-3">
            {forecast.revenueForecasts.map((rev) => {
              const hasActual = rev.actual !== undefined;
              const surprise = hasActual
                ? rev.actual! - rev.estimate
                : undefined;
              return (
                <div
                  key={rev.quarter}
                  className={`flex items-center justify-between py-1 border-b last:border-b-0 ${
                    isDark ? "border-gray-600" : "border-gray-200"
                  }`}
                >
                  <span
                    className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {rev.quarter}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div
                        className={`text-xs ${isDark ? "text-gray-300" : "text-gray-500"}`}
                      >
                        Est: {formatCurrency(rev.estimate)}
                      </div>
                      {hasActual && (
                        <div
                          className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          Act: {formatCurrency(rev.actual!)}
                        </div>
                      )}
                    </div>
                    {surprise !== undefined && surprise !== 0 && (
                      <SurpriseIndicator surprise={surprise} isDark={isDark} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
