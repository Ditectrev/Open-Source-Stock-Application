"use client";

/**
 * TabNavigation Component
 * Navigation tabs for symbol detail page sections
 * Supports keyboard navigation per WAI-ARIA tab pattern:
 * Arrow Left/Right to move between tabs, Home/End for first/last tab.
 *
 * Requirements: 2.4, 18.2
 */

import { useRef, useCallback } from "react";
import { useTheme } from "@/lib/theme-context";

type TabType =
  | "overview"
  | "financials"
  | "technicals"
  | "forecasts"
  | "seasonals";

export interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "financials", label: "Financials" },
  { id: "technicals", label: "Technicals" },
  { id: "forecasts", label: "Forecasts" },
  { id: "seasonals", label: "Seasonals" },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let nextIndex: number | null = null;

      switch (e.key) {
        case "ArrowRight":
          nextIndex = (index + 1) % TABS.length;
          break;
        case "ArrowLeft":
          nextIndex = (index - 1 + TABS.length) % TABS.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = TABS.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      onTabChange(TABS[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    },
    [onTabChange]
  );

  return (
    <div className="mt-6">
      <div
        className={`border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        <nav
          className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto scrollbar-hide"
          role="tablist"
          aria-label="Symbol detail tabs"
        >
          {TABS.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className={`
                  whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm transition-colors min-h-[44px]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
                  ${
                    isActive
                      ? `border-blue-500 ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`
                      : `border-transparent ${
                          isDark
                            ? "text-gray-400 hover:text-gray-300 hover:border-gray-600"
                            : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
