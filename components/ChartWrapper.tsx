"use client";

/**
 * ChartWrapper Component
 * Wrapper for Lightweight Charts with consistent styling and theme configuration
 * Provides default chart settings and theme for the application
 */

import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineData,
  CandlestickData,
  ColorType,
  CrosshairMode,
  LineStyle,
} from "lightweight-charts";

export interface ChartWrapperProps {
  children?: (chart: IChartApi) => void;
  height?: number;
  isDark?: boolean;
}

/**
 * Default chart configuration with consistent styling
 * Supports light and dark themes
 */
export const getDefaultChartOptions = (
  width: number,
  height: number,
  isDark: boolean = false
) => ({
  width,
  height,
  layout: {
    background: {
      type: ColorType.Solid,
      color: isDark ? "#1e1e1e" : "#ffffff",
    },
    textColor: isDark ? "#d1d5db" : "#333",
  },
  grid: {
    vertLines: { color: isDark ? "#2d2d2d" : "#f0f0f0" },
    horzLines: { color: isDark ? "#2d2d2d" : "#f0f0f0" },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
    vertLine: {
      width: 1 as const,
      color: "#9B7DFF",
      style: LineStyle.Dashed,
    },
    horzLine: {
      width: 1 as const,
      color: "#9B7DFF",
      style: LineStyle.Dashed,
    },
  },
  rightPriceScale: {
    borderColor: isDark ? "#2d2d2d" : "#e0e0e0",
  },
  timeScale: {
    borderColor: isDark ? "#2d2d2d" : "#e0e0e0",
    timeVisible: true,
    secondsVisible: false,
  },
  handleScroll: {
    mouseWheel: true,
    pressedMouseMove: true,
    horzTouchDrag: true,
    vertTouchDrag: true,
  },
  handleScale: {
    axisPressedMouseMove: true,
    mouseWheel: true,
    pinch: true,
  },
});

/**
 * ChartWrapper component that initializes and manages a Lightweight Chart instance
 */
export function ChartWrapper({
  children,
  height = 400,
  isDark = false,
}: ChartWrapperProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Get container width for responsive chart
    const containerWidth = chartContainerRef.current.clientWidth;

    // Create chart with default options
    const chart = createChart(
      chartContainerRef.current,
      getDefaultChartOptions(containerWidth, height, isDark)
    );

    chartRef.current = chart;

    // Call children function with chart instance
    if (children) {
      children(chart);
    }

    // Cleanup on unmount
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [children, height, isDark]);

  // Handle responsive resize
  useEffect(() => {
    if (!chartRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const containerWidth = chartContainerRef.current.clientWidth;
        chartRef.current.applyOptions({
          width: containerWidth,
          height,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial resize

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [height]);

  return (
    <div
      ref={chartContainerRef}
      className="chart-wrapper"
      style={{ position: "relative", width: "100%", height: `${height}px` }}
      role="img"
      aria-label="Financial price chart"
    />
  );
}

// Export types for use in other components
export type { IChartApi, ISeriesApi, LineData, CandlestickData };
