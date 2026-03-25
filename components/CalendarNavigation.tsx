"use client";

/**
 * CalendarNavigation Component
 * Provides tab-style navigation to switch between calendar types.
 *
 * Requirements: 24.2
 */

import { useTheme } from "@/lib/theme-context";

export type CalendarType = "economic" | "earnings" | "dividends" | "ipos";

export interface CalendarNavigationProps {
  activeCalendar: CalendarType;
  onCalendarChange: (calendar: CalendarType) => void;
}

const CALENDAR_TABS: { key: CalendarType; label: string; icon: string }[] = [
  { key: "economic", label: "Economic", icon: "📊" },
  { key: "earnings", label: "Earnings", icon: "💰" },
  { key: "dividends", label: "Dividends", icon: "💵" },
  { key: "ipos", label: "IPOs", icon: "🚀" },
];

export function CalendarNavigation({
  activeCalendar,
  onCalendarChange,
}: CalendarNavigationProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <nav
      className="flex gap-1 p-1 rounded-lg overflow-x-auto"
      role="tablist"
      aria-label="Calendar type navigation"
      data-testid="calendar-navigation"
    >
      {CALENDAR_TABS.map(({ key, label, icon }) => {
        const isActive = activeCalendar === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`calendar-panel-${key}`}
            onClick={() => onCalendarChange(key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              isActive
                ? isDark
                  ? "bg-blue-600 text-white"
                  : "bg-blue-600 text-white"
                : isDark
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            data-testid={`calendar-tab-${key}`}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
