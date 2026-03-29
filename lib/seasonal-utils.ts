/**
 * Seasonal pattern utility functions
 * Aggregates daily return data into monthly returns per year
 * and calculates average monthly returns across all years.
 *
 * Requirements: 7.2
 */

import { SeasonalData } from "@/types";

export interface MonthlyReturn {
  year: number;
  month: number;
  return: number;
}

export interface AggregatedSeasonalData {
  /** Monthly returns grouped by year (one entry per year-month) */
  monthlyReturns: MonthlyReturn[];
  /** Average return for each month (1-12) across all years */
  averageByMonth: Record<number, number>;
  /** Sorted list of unique years present in the data */
  years: number[];
}

/**
 * Aggregates raw daily heatmap data into monthly returns per year.
 * Daily returns for the same year-month are summed (cumulative return).
 * Months with no data are excluded (not zero-filled).
 */
export function aggregateSeasonalData(
  data: SeasonalData | null | undefined
): AggregatedSeasonalData {
  if (!data || !data.heatmap || data.heatmap.length === 0) {
    return { monthlyReturns: [], averageByMonth: {}, years: [] };
  }

  // Group daily returns by year-month and sum them
  const grouped = new Map<
    string,
    { year: number; month: number; total: number }
  >();

  for (const entry of data.heatmap) {
    const key = `${entry.year}-${entry.month}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.total += entry.return;
    } else {
      grouped.set(key, {
        year: entry.year,
        month: entry.month,
        total: entry.return,
      });
    }
  }

  const monthlyReturns: MonthlyReturn[] = [];
  const monthSums = new Map<number, { total: number; count: number }>();
  const yearSet = new Set<number>();

  for (const { year, month, total } of grouped.values()) {
    monthlyReturns.push({ year, month, return: total });
    yearSet.add(year);

    const existing = monthSums.get(month);
    if (existing) {
      existing.total += total;
      existing.count += 1;
    } else {
      monthSums.set(month, { total, count: 1 });
    }
  }

  // Sort monthly returns by year then month
  monthlyReturns.sort((a, b) => a.year - b.year || a.month - b.month);

  // Calculate average by month
  const averageByMonth: Record<number, number> = {};
  for (const [month, { total, count }] of monthSums) {
    averageByMonth[month] = total / count;
  }

  const years = Array.from(yearSet).sort((a, b) => a - b);

  return { monthlyReturns, averageByMonth, years };
}

/**
 * Look up the return for a specific year and month.
 * Returns undefined if no data exists for that cell.
 */
export function getReturnForCell(
  monthlyReturns: MonthlyReturn[],
  year: number,
  month: number
): number | undefined {
  const entry = monthlyReturns.find(
    (r) => r.year === year && r.month === month
  );
  return entry?.return;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/**
 * Returns short month label (Jan, Feb, ...) for month number 1-12.
 */
export function getMonthLabel(month: number): string {
  return MONTH_LABELS[month - 1] ?? "";
}
