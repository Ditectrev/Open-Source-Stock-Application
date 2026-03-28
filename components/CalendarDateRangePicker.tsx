"use client";

/**
 * CalendarDateRangePicker Component
 * Shared date range selection for all calendar types.
 * Highlights today's date via a "Today" quick-select button.
 *
 * Requirements: 24.22, 24.23
 */

import { useTheme } from "@/lib/theme-context";

export interface CalendarDateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  /** Optional id prefix to avoid duplicate ids when multiple pickers exist */
  idPrefix?: string;
}

function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const todayStr = toDateString(new Date());

export function CalendarDateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  idPrefix = "cal",
}: CalendarDateRangePickerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const isToday = startDate === todayStr && endDate === "";

  const handleTodayClick = () => {
    onStartDateChange(todayStr);
    onEndDateChange("");
  };

  const inputClass = `text-sm rounded px-2 py-1 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
    isDark
      ? "bg-gray-700 border-gray-600 text-gray-200"
      : "bg-white border-gray-300 text-gray-700"
  }`;

  const labelClass = `text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="calendar-date-range-picker"
    >
      <button
        onClick={handleTodayClick}
        className={`text-xs px-2.5 py-1 rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isToday
            ? "bg-blue-600 text-white"
            : isDark
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        data-testid="today-button"
        aria-label="Jump to today"
      >
        Today
      </button>

      <label htmlFor={`${idPrefix}-start-date`} className={labelClass}>
        From:
      </label>
      <input
        id={`${idPrefix}-start-date`}
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className={inputClass}
        data-testid="start-date"
      />

      <label htmlFor={`${idPrefix}-end-date`} className={labelClass}>
        To:
      </label>
      <input
        id={`${idPrefix}-end-date`}
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className={inputClass}
        data-testid="end-date"
      />
    </div>
  );
}
