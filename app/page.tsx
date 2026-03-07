"use client";

import { SearchBar } from "@/components/SearchBar";
import { ChartWithIndicators } from "@/components/ChartWithIndicators";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useMemo } from "react";
import { PriceData } from "@/types";

// Generate sample price data
function generateSampleData(days: number = 365): PriceData[] {
  const data: PriceData[] = [];
  const endDate = new Date();
  let price = 100;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    
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
  
  return data;
}

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  
  // Generate sample data (in a real app, this would fetch from API based on selectedSymbol)
  const chartData = useMemo(() => generateSampleData(365), []);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Stock Exchange Application
            </h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              Welcome to the comprehensive web platform for individual long-term
              investors.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-8">
          <SearchBar 
            placeholder="Search stocks by symbol (e.g., AAPL, TSLA, MSFT)..." 
            onSelect={(symbol) => setSelectedSymbol(symbol)}
          />
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {selectedSymbol}
          </h2>
          <ChartWithIndicators 
            data={chartData}
            type="candlestick"
            initialTimeRange="1M"
            height={500}
          />
        </div>
      </div>
    </div>
  );
}
