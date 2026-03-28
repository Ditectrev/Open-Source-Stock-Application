"use client";

/**
 * CalendarNavigation Component
 * Provides tab-style navigation to switch between calendar types.
 * Supports keyboard navigation per WAI-ARIA tab pattern:
 * Arrow Left/Right to move between tabs, Home/End for first/last tab.
 *
 * Requirements: 24.2, 18.2
 */

import { useRef, useCallback } from "react";
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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let nextIndex: number | null = null;

      switch (e.key) {
        case "ArrowRight":
          nextIndex = (index + 1) % CALENDAR_TABS.length;
          break;
        case "ArrowLeft":
          nextIndex = (index - 1 + CALENDAR_TABS.length) % CALENDAR_TABS.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = CALENDAR_TABS.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      onCalendarChange(CALENDAR_TABS[nextIndex].key);
      tabRefs.current[nextIndex]?.focus();
    },
    [onCalendarChange],
  );

  return (
    <nav
      className="flex gap-1 p-1 rounded-lg overflow-x-auto"
      role="tablist"
      aria-label="Calendar type navigation"
      data-testid="calendar-navigation"
    >
      {CALENDAR_TABS.map(({ key, label, icon }, index) => {
        const isActive = activeCalendar === key;
        return (
          <button
            key={key}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onCalendarChange(key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap min-h-[44px]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
              isActive
                ? "bg-blue-600 text-white"
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
