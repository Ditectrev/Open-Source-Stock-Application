"use client";

/**
 * ScreenerTableView Component
 * Displays screener results in a sortable, paginated table with valuation color-coding.
 *
 * Requirements: 26.9, 26.16, 26.18, 26.19, 26.21, 26.22
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import type { ScreenerResult } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScreenerTableViewProps {
  results: ScreenerResult[];
  onSymbolClick?: (symbol: string) => void;
}

type SortField = keyof Pick<
  ScreenerResult,
  | "symbol"
  | "name"
  | "price"
  | "changePercent"
  | "volume"
  | "marketCap"
  | "peRatio"
  | "sector"
  | "valuationContext"
>;

type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

const PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatVolume(volume: number): string {
  return volume.toLocaleString("en-US");
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
  if (cap >= 1e3) return `$${(cap / 1e3).toFixed(1)}K`;
  return `$${cap.toFixed(0)}`;
}

function formatChangePercent(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function compareValues(
  a: ScreenerResult,
  b: ScreenerResult,
  field: SortField,
  direction: SortDirection
): number {
  const aVal = a[field];
  const bVal = b[field];

  // Handle undefined (optional fields like peRatio)
  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return direction === "asc" ? 1 : -1;
  if (bVal == null) return direction === "asc" ? -1 : 1;

  let cmp: number;
  if (typeof aVal === "string" && typeof bVal === "string") {
    cmp = aVal.localeCompare(bVal);
  } else {
    cmp = (aVal as number) - (bVal as number);
  }

  return direction === "asc" ? cmp : -cmp;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "symbol", label: "Symbol" },
  { field: "name", label: "Name" },
  { field: "price", label: "Price" },
  { field: "changePercent", label: "Change %" },
  { field: "volume", label: "Volume" },
  { field: "marketCap", label: "Market Cap" },
  { field: "peRatio", label: "P/E" },
  { field: "sector", label: "Sector" },
  { field: "valuationContext", label: "Valuation" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScreenerTableView({
  results,
  onSymbolClick,
}: ScreenerTableViewProps) {
  const [sort, setSort] = useState<SortState>({
    field: "symbol",
    direction: "asc",
  });
  const [page, setPage] = useState(0);

  const handleSort = useCallback((field: SortField) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(0);
  }, []);

  const sorted = useMemo(
    () =>
      [...results].sort((a, b) =>
        compareValues(a, b, sort.field, sort.direction)
      ),
    [results, sort]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page when results change
  useEffect(() => {
    setPage(0);
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center text-gray-500 dark:text-gray-300">
        No results
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto -mx-0">
        <table
          className="w-full text-sm md:text-sm lg:text-base"
          aria-label="Screener results"
        >
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              {COLUMNS.map((col) => (
                <th
                  key={col.field}
                  className="px-3 md:px-4 lg:px-5 py-2 md:py-3 text-left font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort(col.field)}
                  aria-sort={
                    sort.field === col.field
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sort.field === col.field && (
                      <span aria-hidden="true">
                        {sort.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => {
              const rowBg =
                row.valuationContext === "overpriced"
                  ? "bg-red-50 dark:bg-red-900/20"
                  : row.valuationContext === "underpriced"
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "";

              return (
                <tr
                  key={row.symbol}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${rowBg}`}
                  onClick={() => onSymbolClick?.(row.symbol)}
                  data-testid={`row-${row.symbol}`}
                >
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                    {row.symbol}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                    {row.name}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 tabular-nums">
                    {formatPrice(row.price)}
                  </td>
                  <td
                    className={`px-3 py-2 font-medium tabular-nums ${
                      row.changePercent > 0
                        ? "text-green-600 dark:text-green-400"
                        : row.changePercent < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {formatChangePercent(row.changePercent)}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300 tabular-nums">
                    {formatVolume(row.volume)}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300 tabular-nums">
                    {formatMarketCap(row.marketCap)}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300 tabular-nums">
                    {row.peRatio != null ? row.peRatio.toFixed(1) : "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                    {row.sector}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.valuationContext === "overpriced"
                          ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                          : row.valuationContext === "underpriced"
                            ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {row.valuationContext}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
