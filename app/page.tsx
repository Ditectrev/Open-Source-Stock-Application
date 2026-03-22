"use client";

import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { SymbolData, PriceData, TechnicalIndicators, ForecastData, SeasonalData, FinancialData, TimeRange } from "@/types";
import { SymbolHeader } from "@/components/SymbolHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { OverviewTab } from "@/components/OverviewTab";
import { TechnicalIndicatorsDisplay } from "@/components/TechnicalIndicatorsDisplay";
import { ForecastDisplay } from "@/components/ForecastDisplay";
import { SeasonalHeatmap } from "@/components/SeasonalHeatmap";
import { FinancialsTable } from "@/components/FinancialsTable";
import { FearGreedGauge } from "@/components/FearGreedGauge";

type TabType = "overview" | "financials" | "technicals" | "forecasts" | "seasonals";

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [symbolData, setSymbolData] = useState<SymbolData | null>(null);
  const [historicalData, setHistoricalData] = useState<PriceData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicators | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [seasonalData, setSeasonalData] = useState<SeasonalData | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);

  // Fetch symbol data when selected
  useEffect(() => {
    const fetchSymbolData = async () => {
      if (!selectedSymbol) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch current symbol data
        const symbolResponse = await fetch(`/api/market/symbol/${selectedSymbol}`);
        if (!symbolResponse.ok) {
          throw new Error("Failed to fetch symbol data");
        }
        const symbolResult = await symbolResponse.json();
        setSymbolData(symbolResult.data);

        // Fetch historical data
        const historicalResponse = await fetch(
          `/api/market/historical/${selectedSymbol}?range=${timeRange}`
        );
        if (!historicalResponse.ok) {
          throw new Error("Failed to fetch historical data");
        }
        const historicalResult = await historicalResponse.json();
        setHistoricalData(historicalResult.data);

        // Fetch technical indicators
        const indicatorsResponse = await fetch(`/api/market/indicators/${selectedSymbol}`);
        if (indicatorsResponse.ok) {
          const indicatorsResult = await indicatorsResponse.json();
          setTechnicalIndicators(indicatorsResult.data);
        }

        // Fetch forecast data
        const forecastResponse = await fetch(`/api/market/forecast/${selectedSymbol}`);
        if (forecastResponse.ok) {
          const forecastResult = await forecastResponse.json();
          setForecastData(forecastResult.data);
        }

        // Fetch seasonal data
        const seasonalResponse = await fetch(`/api/market/seasonal/${selectedSymbol}`);
        if (seasonalResponse.ok) {
          const seasonalResult = await seasonalResponse.json();
          setSeasonalData(seasonalResult.data);
        }

        // Fetch financials data
        const financialsResponse = await fetch(`/api/market/financials/${selectedSymbol}`);
        if (financialsResponse.ok) {
          const financialsResult = await financialsResponse.json();
          setFinancialData(financialsResult.data);
        }
      } catch (err) {
        console.error("Error fetching symbol data:", err);
        setError(err instanceof Error ? err.message : "Failed to load symbol data");
      } finally {
        setLoading(false);
      }
    };

    fetchSymbolData();
  }, [selectedSymbol, timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

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
            onSelect={(symbol) => {
              setSelectedSymbol(symbol);
              setActiveTab("overview");
            }}
          />
        </div>

        {/* Symbol Detail Section */}
        {selectedSymbol && (
          <div className="mt-8">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Loading {selectedSymbol}...
                  </p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-12">
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 max-w-md mx-auto">
                  <h2 className="text-xl font-semibold mb-2">Error Loading Symbol</h2>
                  <p className="mb-4">{error}</p>
                  <button
                    onClick={() => setSelectedSymbol(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {symbolData && !loading && !error && (
              <>
                {/* Symbol Header */}
                <SymbolHeader symbolData={symbolData} />

                {/* Tab Navigation */}
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Tab Content */}
                <div className="mt-6">
                  {activeTab === "overview" && (
                    <OverviewTab
                      symbolData={symbolData}
                      historicalData={historicalData}
                      timeRange={timeRange}
                      onTimeRangeChange={handleTimeRangeChange}
                    />
                  )}
                  {activeTab === "financials" && (
                    <FinancialsTable financials={financialData} />
                  )}
                  {activeTab === "technicals" && (
                    <TechnicalIndicatorsDisplay indicators={technicalIndicators} />
                  )}
                  {activeTab === "forecasts" && (
                    <ForecastDisplay forecast={forecastData} />
                  )}
                  {activeTab === "seasonals" && (
                    <SeasonalHeatmap data={seasonalData} />
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Welcome Message when no symbol selected */}
        {!selectedSymbol && (
          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Search prompt */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center flex flex-col justify-center">
                <svg
                  className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Search for a Stock Symbol
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Use the search bar above to find and analyze stocks. View detailed
                  information including price charts, technical indicators, forecasts,
                  and more.
                </p>
              </div>

              {/* Market Sentiment */}
              <FearGreedGauge />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
