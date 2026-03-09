"use client";

/**
 * TabNavigation Component
 * Navigation tabs for symbol detail page sections
 * 
 * Requirements: 2.4
 */

import { useTheme } from "@/lib/theme-context";

type TabType = "overview" | "financials" | "technicals" | "forecasts" | "seasonals";

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

  return (
    <div className="mt-6">
      <div
        className={`border-b ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
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
                aria-current={isActive ? "page" : undefined}
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
