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
import { WorldMarkets } from "@/components/WorldMarkets";
import { SectorHub } from "@/components/SectorHub";
import { EconomicCalendar } from "@/components/EconomicCalendar";
import { EarningsCalendar } from "@/components/EarningsCalendar";
import { DividendCalendar } from "@/components/DividendCalendar";
import { IPOCalendar } from "@/components/IPOCalendar";
import { CalendarHub } from "@/components/CalendarHub";
import { HeatmapComponent } from "@/components/HeatmapComponent";
import type { HeatmapTimePeriod, HeatmapSortField, HeatmapSortDirection } from "@/components/HeatmapComponent";
import { ETFHeatmap } from "@/components/ETFHeatmap";
import { CryptoHeatmap } from "@/components/CryptoHeatmap";
import { Footer } from "@/components/Footer";
import { HeatmapData } from "@/types";

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

  // Heatmap state
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapPeriod, setHeatmapPeriod] = useState<HeatmapTimePeriod>("1D");
  const [heatmapSortField, setHeatmapSortField] = useState<HeatmapSortField>("changePercent");
  const [heatmapSortDirection, setHeatmapSortDirection] = useState<HeatmapSortDirection>("desc");
  const [heatmapSectorFilter, setHeatmapSectorFilter] = useState<string>("");

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

  // Fetch heatmap data from sectors endpoint
  const fetchHeatmapData = async () => {
    setHeatmapLoading(true);
    try {
      const res = await fetch(`/api/market/sectors?period=${heatmapPeriod}`);
      if (res.ok) {
        const result = await res.json();
        const seen = new Set<string>();
        const items: HeatmapData[] = (result.data ?? []).reduce(
          (
            acc: HeatmapData[],
            s: { sector: string; performance: number; changePercent: number }
          ) => {
            const key = s.sector.replace(/\s+/g, "-").toUpperCase();
            if (!seen.has(key)) {
              seen.add(key);
              acc.push({
                symbol: key,
                name: s.sector,
                value: s.performance,
                changePercent: s.changePercent,
                sector: s.sector,
              });
            }
            return acc;
          },
          []
        );
        setHeatmapData(items);
      }
    } catch {
      // silently degrade — heatmap is supplementary
    } finally {
      setHeatmapLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedSymbol) {
      fetchHeatmapData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heatmapPeriod, selectedSymbol]);

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
            <FearGreedGauge />
            <div className="mt-8">
              <WorldMarkets />
            </div>
            <div className="mt-8">
              <SectorHub />
            </div>
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Market Heatmap
              </h2>
              <HeatmapComponent
                data={heatmapData}
                loading={heatmapLoading}
                timePeriod={heatmapPeriod}
                onTimePeriodChange={setHeatmapPeriod}
                sortField={heatmapSortField}
                sortDirection={heatmapSortDirection}
                onSortChange={(field, dir) => {
                  setHeatmapSortField(field);
                  setHeatmapSortDirection(dir);
                }}
                sectorFilter={heatmapSectorFilter}
                onSectorFilterChange={setHeatmapSectorFilter}
                onTileClick={(item) => {
                  setSelectedSymbol(item.symbol);
                  setActiveTab("overview");
                }}
                refreshInterval={60000}
                onRefresh={fetchHeatmapData}
              />
            </div>
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                ETF Heatmap
              </h2>
              <ETFHeatmap
                refreshInterval={60000}
                onETFClick={(symbol) => {
                  setSelectedSymbol(symbol);
                  setActiveTab("overview");
                }}
              />
            </div>
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Crypto Heatmap
              </h2>
              <CryptoHeatmap
                refreshInterval={60000}
                onCryptoClick={(symbol) => {
                  setSelectedSymbol(symbol);
                  setActiveTab("overview");
                }}
              />
            </div>
            <div className="mt-8">
              <CalendarHub
                onSymbolClick={(symbol) => {
                  setSelectedSymbol(symbol);
                  setActiveTab("overview");
                }}
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
