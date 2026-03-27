"use client";

/**
 * WorldMarkets Component
 * Displays major market indices grouped by region (Americas, Asia-Pacific, Europe)
 * with current values, percentage changes, and color-coded performance.
 * Auto-refreshes at configurable intervals.
 *
 * Requirements: 10.1, 10.2, 10.3, 10.5
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "@/lib/theme-context";
import { MarketIndex } from "@/types";

const REGIONS = ["Americas", "Europe", "Asia-Pacific"] as const;
type Region = (typeof REGIONS)[number];

const DEFAULT_REFRESH_INTERVAL = 60_000; // 60 seconds

export interface WorldMarketsProps {
  /** Pre-loaded data (skips initial fetch when provided) */
  data?: MarketIndex[];
  /** Auto-refresh interval in milliseconds. Set to 0 to disable. Defaults to 60000. */
  refreshInterval?: number;
}

function formatValue(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}`;
}

export function WorldMarkets({
  data: externalData,
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
}: WorldMarketsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [data, setData] = useState<MarketIndex[] | null>(externalData ?? null);
  const [loading, setLoading] = useState(!externalData);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/market/world-markets");
      if (!res.ok) throw new Error("Failed to fetch world markets data");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Unknown error");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh
  useEffect(() => {
    if (externalData) {
      setData(externalData);
      setLoading(false);
      return;
    }

    fetchData();

    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [externalData, fetchData, refreshInterval]);

  // Group indices by region
  const grouped: Record<Region, MarketIndex[]> = {
    Americas: [],
    "Asia-Pacific": [],
    Europe: [],
  };

  if (data) {
    for (const idx of data) {
      const bucket = grouped[idx.region];
      if (bucket) {
        bucket.push(idx);
      } else {
        grouped.Americas.push(idx);
      }
    }
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
        data-testid="world-markets-loading"
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
        data-testid="world-markets-error"
      >
        <p className="text-red-500 text-center">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            fetchData();
          }}
          className="mt-2 mx-auto block text-sm text-blue-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
      data-testid="world-markets"
    >
      <h3
        className={`text-lg font-semibold mb-3 sm:mb-4 lg:mb-5 ${isDark ? "text-white" : "text-gray-900"}`}
      >
        World Markets
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {REGIONS.map((region) => {
          const indices = grouped[region];
          if (indices.length === 0) return null;

          return (
            <div key={region} data-testid={`region-${region}`}>
              <h4
                className={`text-sm font-semibold mb-3 pb-1 border-b ${
                  isDark
                    ? "text-gray-300 border-gray-700"
                    : "text-gray-700 border-gray-200"
                }`}
              >
                {region}
              </h4>

              <ul className="space-y-2">
                {indices.map((idx) => {
                  const isPositive = idx.changePercent >= 0;
                  const colorClass = isPositive
                    ? "text-green-500"
                    : "text-red-500";

                  return (
                    <li
                      key={idx.symbol}
                      className={`flex items-center justify-between py-2 sm:py-1.5 px-2 rounded min-h-[44px] ${
                        isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                      }`}
                      data-testid={`index-${idx.symbol}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium truncate ${
                            isDark ? "text-gray-200" : "text-gray-900"
                          }`}
                        >
                          {idx.name}
                        </p>
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {idx.symbol}
                        </p>
                      </div>

                      <div className="text-right ml-3 flex-shrink-0">
                        <p
                          className={`text-sm font-medium ${
                            isDark ? "text-gray-200" : "text-gray-900"
                          }`}
                          data-testid={`value-${idx.symbol}`}
                        >
                          {formatValue(idx.value)}
                        </p>
                        <p
                          className={`text-xs font-medium ${colorClass}`}
                          data-testid={`change-${idx.symbol}`}
                        >
                          {formatChange(idx.change)} ({formatPercent(idx.changePercent)})
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
