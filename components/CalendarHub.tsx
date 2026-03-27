"use client";

/**
 * CalendarHub Component
 * Wraps CalendarNavigation with the active calendar panel.
 * Provides unified calendar switching experience.
 *
 * Requirements: 24.2
 */

import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import {
  CalendarNavigation,
  CalendarType,
} from "@/components/CalendarNavigation";
import { EconomicCalendar } from "@/components/EconomicCalendar";
import { EarningsCalendar } from "@/components/EarningsCalendar";
import { DividendCalendar } from "@/components/DividendCalendar";
import { IPOCalendar } from "@/components/IPOCalendar";

export interface CalendarHubProps {
  defaultCalendar?: CalendarType;
  onSymbolClick?: (symbol: string) => void;
}

export function CalendarHub({
  defaultCalendar = "economic",
  onSymbolClick,
}: CalendarHubProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [activeCalendar, setActiveCalendar] =
    useState<CalendarType>(defaultCalendar);

  return (
    <div data-testid="calendar-hub">
      <h2
        className={`text-xl font-semibold mb-3 md:mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
      >
        Calendars
      </h2>
      <CalendarNavigation
        activeCalendar={activeCalendar}
        onCalendarChange={setActiveCalendar}
      />
      <div className="mt-4" id={`calendar-panel-${activeCalendar}`}>
        {activeCalendar === "economic" && <EconomicCalendar />}
        {activeCalendar === "earnings" && (
          <EarningsCalendar onSymbolClick={onSymbolClick} />
        )}
        {activeCalendar === "dividends" && (
          <DividendCalendar onSymbolClick={onSymbolClick} />
        )}
        {activeCalendar === "ipos" && (
          <IPOCalendar onSymbolClick={onSymbolClick} />
        )}
      </div>
    </div>
  );
}
