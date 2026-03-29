"use client";

/**
 * SeasonalHeatmap Component
 * Displays a heatmap of monthly returns across years.
 * Months as columns, years as rows. Color-coded green/red by return magnitude.
 * Shows return percentage on hover and includes a past-performance disclaimer.
 *
 * Requirements: 7.1, 7.3, 7.4
 */

import { SeasonalData } from "@/types";
import { useTheme } from "@/lib/theme-context";
import { useState } from "react";
import {
  aggregateSeasonalData,
  getReturnForCell,
  getMonthLabel,
} from "@/lib/seasonal-utils";

export interface SeasonalHeatmapProps {
  data: SeasonalData | null | undefined;
}

interface HoveredCell {
  year: number;
  month: number;
  value: number;
}

/**
 * Maps a return percentage to a background color class.
 * Green for positive, red for negative, intensity scales with magnitude.
 */
function getCellColor(value: number | undefined, isDark: boolean): string {
  if (value === undefined) {
    return isDark ? "bg-gray-700" : "bg-gray-100";
  }

  const abs = Math.abs(value);

  if (value > 0) {
    if (abs >= 5) return isDark ? "bg-green-600" : "bg-green-500";
    if (abs >= 2) return isDark ? "bg-green-700" : "bg-green-400";
    return isDark ? "bg-green-800" : "bg-green-200";
  }

  if (value < 0) {
    if (abs >= 5) return isDark ? "bg-red-600" : "bg-red-500";
    if (abs >= 2) return isDark ? "bg-red-700" : "bg-red-400";
    return isDark ? "bg-red-800" : "bg-red-200";
  }

  return isDark ? "bg-gray-600" : "bg-gray-200";
}

function getCellTextColor(value: number | undefined, isDark: boolean): string {
  if (value === undefined) {
    return isDark ? "text-gray-300" : "text-gray-500";
  }
  const abs = Math.abs(value);
  if (abs >= 2) return "text-white";
  return isDark ? "text-gray-200" : "text-gray-800";
}

export function SeasonalHeatmap({ data }: SeasonalHeatmapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const { monthlyReturns, averageByMonth, years } = aggregateSeasonalData(data);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Loading / empty state
  if (!data) {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
      >
        <h2
          className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Seasonal Patterns
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-10 rounded animate-pulse ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (years.length === 0) {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
      >
        <h2
          className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Seasonal Patterns
        </h2>
        <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-500"}`}>
          No seasonal data available.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
    >
      <h2
        className={`text-lg font-semibold mb-3 sm:mb-4 lg:mb-5 ${isDark ? "text-white" : "text-gray-900"}`}
      >
        Seasonal Patterns
      </h2>

      {/* Heatmap grid */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table
          className="w-full border-collapse text-xs md:text-sm lg:text-base"
          role="grid"
          aria-label="Seasonal returns heatmap by month and year"
        >
          <thead>
            <tr>
              <th
                className={`px-2 py-2 text-left font-medium ${
                  isDark ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Year
              </th>
              {months.map((m) => (
                <th
                  key={m}
                  className={`px-2 py-2 text-center font-medium ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {getMonthLabel(m)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((year) => (
              <tr key={year}>
                <td
                  className={`px-2 py-1 font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {year}
                </td>
                {months.map((month) => {
                  const value = getReturnForCell(monthlyReturns, year, month);
                  const isHovered =
                    hovered?.year === year && hovered?.month === month;

                  return (
                    <td
                      key={month}
                      className="px-0.5 py-0.5"
                      onMouseEnter={() =>
                        value !== undefined
                          ? setHovered({ year, month, value })
                          : setHovered(null)
                      }
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div
                        className={`relative rounded px-2 py-1.5 text-center transition-all ${getCellColor(
                          value,
                          isDark
                        )} ${getCellTextColor(value, isDark)} ${
                          isHovered ? "ring-2 ring-blue-400 z-10" : ""
                        }`}
                      >
                        {value !== undefined ? `${value.toFixed(1)}%` : "—"}

                        {/* Tooltip on hover */}
                        {isHovered && value !== undefined && (
                          <div
                            className={`absolute z-20 w-40 p-2 rounded shadow-lg text-xs ${
                              isDark
                                ? "bg-gray-900 text-gray-200 border border-gray-700"
                                : "bg-white text-gray-700 border border-gray-200"
                            }`}
                            style={{
                              bottom: "calc(100% + 4px)",
                              left: "50%",
                              transform: "translateX(-50%)",
                            }}
                          >
                            <div className="font-semibold">
                              {getMonthLabel(month)} {year}
                            </div>
                            <div>
                              Return:{" "}
                              <span
                                className={
                                  value >= 0
                                    ? isDark
                                      ? "text-green-400"
                                      : "text-green-600"
                                    : isDark
                                      ? "text-red-400"
                                      : "text-red-600"
                                }
                              >
                                {value >= 0 ? "+" : ""}
                                {value.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Average row */}
            <tr
              className={`border-t-2 ${isDark ? "border-gray-600" : "border-gray-300"}`}
            >
              <td
                className={`px-2 py-1 font-semibold ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Avg
              </td>
              {months.map((month) => {
                const avg = averageByMonth[month];
                return (
                  <td key={month} className="px-0.5 py-0.5">
                    <div
                      className={`rounded px-2 py-1.5 text-center font-semibold ${getCellColor(
                        avg,
                        isDark
                      )} ${getCellTextColor(avg, isDark)}`}
                    >
                      {avg !== undefined ? `${avg.toFixed(1)}%` : "—"}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-4 text-xs flex-wrap">
        <span className={isDark ? "text-gray-300" : "text-gray-500"}>
          Legend:
        </span>
        <div className="flex items-center gap-1">
          <div
            className={`w-4 h-4 rounded ${isDark ? "bg-green-600" : "bg-green-500"}`}
          />
          <span className={isDark ? "text-gray-300" : "text-gray-500"}>
            Strong positive
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-4 h-4 rounded ${isDark ? "bg-green-800" : "bg-green-200"}`}
          />
          <span className={isDark ? "text-gray-300" : "text-gray-500"}>
            Mild positive
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-4 h-4 rounded ${isDark ? "bg-red-800" : "bg-red-200"}`}
          />
          <span className={isDark ? "text-gray-300" : "text-gray-500"}>
            Mild negative
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-4 h-4 rounded ${isDark ? "bg-red-600" : "bg-red-500"}`}
          />
          <span className={isDark ? "text-gray-300" : "text-gray-500"}>
            Strong negative
          </span>
        </div>
      </div>

      {/* Disclaimer - Requirement 7.3 */}
      <p
        className={`mt-4 text-xs italic ${
          isDark ? "text-gray-300" : "text-gray-500"
        }`}
      >
        Past seasonality does not guarantee future performance
      </p>
    </div>
  );
}
