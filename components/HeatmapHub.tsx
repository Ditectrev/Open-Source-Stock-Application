"use client";

/**
 * HeatmapHub Component
 * Wraps HeatmapNavigation with the active heatmap panel.
 * Provides unified heatmap switching experience.
 *
 * Requirements: 25.2
 */

import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { HeatmapNavigation, HeatmapType } from "@/components/HeatmapNavigation";
import { ETFHeatmap } from "@/components/ETFHeatmap";
import { CryptoHeatmap } from "@/components/CryptoHeatmap";
import { StockHeatmap } from "@/components/StockHeatmap";

export interface HeatmapHubProps {
  defaultHeatmap?: HeatmapType;
  refreshInterval?: number;
  onSymbolClick?: (symbol: string) => void;
}

export function HeatmapHub({
  defaultHeatmap = "etf",
  refreshInterval = 60000,
  onSymbolClick,
}: HeatmapHubProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [activeHeatmap, setActiveHeatmap] =
    useState<HeatmapType>(defaultHeatmap);

  return (
    <div data-testid="heatmap-hub">
      <h2
        className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
      >
        Heatmaps
      </h2>
      <HeatmapNavigation
        activeHeatmap={activeHeatmap}
        onHeatmapChange={setActiveHeatmap}
      />
      <div className="mt-4" id={`heatmap-panel-${activeHeatmap}`}>
        {activeHeatmap === "etf" && (
          <ETFHeatmap
            refreshInterval={refreshInterval}
            onETFClick={onSymbolClick}
          />
        )}
        {activeHeatmap === "crypto" && (
          <CryptoHeatmap
            refreshInterval={refreshInterval}
            onCryptoClick={onSymbolClick}
          />
        )}
        {activeHeatmap === "stock" && (
          <StockHeatmap
            refreshInterval={refreshInterval}
            onStockClick={onSymbolClick}
          />
        )}
      </div>
    </div>
  );
}
