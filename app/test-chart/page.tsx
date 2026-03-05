"use client";

/**
 * Test page for ChartComponent
 * Validates chart functionality with sample data
 */

import { ChartComponent } from "@/components/ChartComponent";
import { TechnicalIndicatorOverlay } from "@/components/TechnicalIndicatorOverlay";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider, useTheme } from "@/lib/theme-context";
import { PriceData, ChartIndicator } from "@/types";
import { useState } from "react";

// Generate sample price data ending at today with hourly granularity for recent data
function generateSampleData(days: number = 365): PriceData[] {
  const data: PriceData[] = [];
  const endDate = new Date(); // End at current time
  
  let price = 100;
  
  // Generate daily data for older periods (more than 2 days ago)
  const dailyDataDays = days - 2;
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - dailyDataDays);
  startDate.setHours(0, 0, 0, 0); // Start at midnight
  
  for (let i = 0; i < dailyDataDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const change = (Math.random() - 0.5) * 5;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    const volume = Math.floor(Math.random() * 10000000) + 1000000;
    
    data.push({
      timestamp: date,
      open,
      high,
      low,
      close,
      volume,
    });
    
    price = close;
  }
  
  // Generate hourly data for the last 48 hours
  const hoursToGenerate = 48;
  const hourlyStartDate = new Date(endDate);
  hourlyStartDate.setHours(hourlyStartDate.getHours() - hoursToGenerate);
  
  for (let i = 0; i <= hoursToGenerate; i++) {
    const date = new Date(hourlyStartDate);
    date.setHours(date.getHours() + i);
    
    const change = (Math.random() - 0.5) * 2;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 1;
    const low = Math.min(open, close) - Math.random() * 1;
    const volume = Math.floor(Math.random() * 5000000) + 500000;
    
    data.push({
      timestamp: date,
      open,
      high,
      low,
      close,
      volume,
    });
    
    price = close;
  }
  
  // Sort by timestamp to ensure ascending order
  data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  return data;
}

export default function TestChartPage() {
  return (
    <ThemeProvider>
      <TestChartContent />
    </ThemeProvider>
  );
}

function TestChartContent() {
  // Initialize with default indicators to maintain consistent state
  const [indicators, setIndicators] = useState<ChartIndicator[]>([
    { type: "MA", period: 50, color: "#FF6B6B", visible: false },
    { type: "MA", period: 200, color: "#4ECDC4", visible: false },
    { type: "EMA", period: 20, color: "#95E1D3", visible: false },
    { type: "RSI", period: 14, color: "#F38181", visible: false },
    { type: "MACD", color: "#AA96DA", visible: false },
    { type: "BB", period: 20, color: "#FCBAD3", visible: false },
  ]);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  
  // Memoize sample data to prevent regeneration on every render
  const sampleData = useState(() => generateSampleData(1825))[0];
  
  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="w-full px-4 py-8">
        <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Chart Component Test
          </h1>
          <ThemeToggle />
        </div>
        
        <div className="mb-6 max-w-7xl mx-auto">
          <TechnicalIndicatorOverlay
            initialIndicators={indicators}
            onIndicatorsChange={setIndicators}
          />
        </div>
        
        <div className={`rounded-lg shadow-lg p-6 max-w-7xl mx-auto ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <ChartComponent
            data={sampleData}
            type="candlestick"
            initialTimeRange="1M"
            indicators={indicators}
            responsive={true}
            height={600}
          />
        </div>
        
        <div className={`mt-8 p-4 rounded-lg max-w-7xl mx-auto ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`}>
          <h2 className={`font-semibold mb-2 ${isDark ? "text-blue-200" : "text-blue-900"}`}>
            Test Instructions:
          </h2>
          <ul className={`list-disc list-inside space-y-1 text-sm ${isDark ? "text-blue-100" : "text-blue-800"}`}>
            <li>Try switching between time ranges (1D, 1W, 1M, etc.)</li>
            <li>Switch between chart types (Line, Area, Candles)</li>
            <li>Use mouse wheel to zoom in/out</li>
            <li>Click and drag to pan the chart</li>
            <li>Hover over the chart to see crosshair and data points</li>
            <li>Toggle technical indicators on/off</li>
            <li>Resize the browser window to test responsive behavior</li>
            <li>Use the theme toggle to switch between Light, Dark, and System themes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
