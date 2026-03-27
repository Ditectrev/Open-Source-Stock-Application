"use client";

/**
 * HeatmapNavigation Component
 * Provides tab-style navigation to switch between heatmap types.
 *
 * Requirements: 25.2
 */

import { useTheme } from "@/lib/theme-context";

export type HeatmapType = "etf" | "crypto" | "stock";

export interface HeatmapNavigationProps {
  activeHeatmap: HeatmapType;
  onHeatmapChange: (heatmap: HeatmapType) => void;
}

const HEATMAP_TABS: { key: HeatmapType; label: string; icon: string }[] = [
  { key: "etf", label: "ETFs", icon: "📈" },
  { key: "crypto", label: "Crypto", icon: "🪙" },
  { key: "stock", label: "Stocks", icon: "🏢" },
];

export function HeatmapNavigation({
  activeHeatmap,
  onHeatmapChange,
}: HeatmapNavigationProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <nav
      className="flex gap-1 p-1 rounded-lg overflow-x-auto"
      role="tablist"
      aria-label="Heatmap type navigation"
      data-testid="heatmap-navigation"
    >
      {HEATMAP_TABS.map(({ key, label, icon }) => {
        const isActive = activeHeatmap === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`heatmap-panel-${key}`}
            onClick={() => onHeatmapChange(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap min-h-[44px] ${
              isActive
                ? "bg-blue-600 text-white"
                : isDark
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            data-testid={`heatmap-tab-${key}`}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
