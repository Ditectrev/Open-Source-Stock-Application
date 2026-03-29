"use client";

import dynamic from "next/dynamic";
import { Navigation } from "@/components/Navigation";
import { useState, useEffect, useRef } from "react";
import {
  SymbolData,
  PriceData,
  TechnicalIndicators,
  ForecastData,
  SeasonalData,
  FinancialData,
  TimeRange,
} from "@/types";
import { SymbolHeader } from "@/components/SymbolHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// ---------------------------------------------------------------------------
// Dynamically imported heavy components (code splitting – Req 15.2)
// ---------------------------------------------------------------------------

const OverviewTab = dynamic(
  () => import("@/components/OverviewTab").then((m) => m.OverviewTab),
  {
    loading: () => <LoadingSpinner size="md" message="Loading overview..." />,
    ssr: false,
  }
);

const TechnicalIndicatorsDisplay = dynamic(
  () =>
    import("@/components/TechnicalIndicatorsDisplay").then(
      (m) => m.TechnicalIndicatorsDisplay
    ),
  {
    loading: () => <LoadingSpinner size="md" message="Loading technicals..." />,
    ssr: false,
  }
);

const ForecastDisplay = dynamic(
  () => import("@/components/ForecastDisplay").then((m) => m.ForecastDisplay),
  {
    loading: () => <LoadingSpinner size="md" message="Loading forecasts..." />,
    ssr: false,
  }
);

const SeasonalHeatmap = dynamic(
  () => import("@/components/SeasonalHeatmap").then((m) => m.SeasonalHeatmap),
  {
    loading: () => <LoadingSpinner size="md" message="Loading seasonals..." />,
    ssr: false,
  }
);

const FinancialsTable = dynamic(
  () => import("@/components/FinancialsTable").then((m) => m.FinancialsTable),
  {
    loading: () => <LoadingSpinner size="md" message="Loading financials..." />,
    ssr: false,
  }
);

const FearGreedGauge = dynamic(
  () => import("@/components/FearGreedGauge").then((m) => m.FearGreedGauge),
  {
    loading: () => (
      <div style={{ minHeight: 320 }}>
        <LoadingSpinner size="md" message="Loading Fear & Greed..." />
      </div>
    ),
    ssr: false,
  }
);

const WorldMarkets = dynamic(
  () => import("@/components/WorldMarkets").then((m) => m.WorldMarkets),
  {
    loading: () => (
      <div style={{ minHeight: 300 }}>
        <LoadingSpinner size="md" message="Loading world markets..." />
      </div>
    ),
    ssr: false,
  }
);

const SectorHub = dynamic(
  () => import("@/components/SectorHub").then((m) => m.SectorHub),
  {
    loading: () => (
      <div style={{ minHeight: 300 }}>
        <LoadingSpinner size="md" message="Loading sectors..." />
      </div>
    ),
    ssr: false,
  }
);

const HeatmapHub = dynamic(
  () => import("@/components/HeatmapHub").then((m) => m.HeatmapHub),
  {
    loading: () => <LoadingSpinner size="md" message="Loading heatmaps..." />,
    ssr: false,
  }
);

const ScreenerHub = dynamic(
  () => import("@/components/ScreenerHub").then((m) => m.ScreenerHub),
  {
    loading: () => <LoadingSpinner size="md" message="Loading screener..." />,
    ssr: false,
  }
);

const CalendarHub = dynamic(
  () => import("@/components/CalendarHub").then((m) => m.CalendarHub),
  {
    loading: () => <LoadingSpinner size="md" message="Loading calendars..." />,
    ssr: false,
  }
);

const Footer = dynamic(
  () => import("@/components/Footer").then((m) => m.Footer),
  { ssr: false }
);

/**
 * Defers rendering of children until the wrapper scrolls near the viewport.
 * Reduces initial JS execution and DOM size for below-the-fold sections.
 */
function LazySection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} id={id} className={className}>
      {visible ? children : <div style={{ minHeight: 200 }} />}
    </div>
  );
}

type TabType =
  | "overview"
  | "financials"
  | "technicals"
  | "forecasts"
  | "seasonals";

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [symbolData, setSymbolData] = useState<SymbolData | null>(null);
  const [historicalData, setHistoricalData] = useState<PriceData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technicalIndicators, setTechnicalIndicators] =
    useState<TechnicalIndicators | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [seasonalData, setSeasonalData] = useState<SeasonalData | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(
    null
  );
  const [activeSection, setActiveSection] = useState("home");

  const handleSectionChange = (section: string) => {
    if (section === "home") {
      setSelectedSymbol(null);
      setActiveSection("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Clear symbol view when navigating to a dashboard section
    setSelectedSymbol(null);
    setActiveSection(section);
    // Scroll to the section after a tick so the DOM has rendered
    setTimeout(() => {
      const el = document.getElementById(`section-${section}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // Fetch symbol data when selected
  useEffect(() => {
    const fetchSymbolData = async () => {
      if (!selectedSymbol) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch current symbol data
        const symbolResponse = await fetch(
          `/api/market/symbol/${selectedSymbol}`
        );
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
        const indicatorsResponse = await fetch(
          `/api/market/indicators/${selectedSymbol}`
        );
        if (indicatorsResponse.ok) {
          const indicatorsResult = await indicatorsResponse.json();
          setTechnicalIndicators(indicatorsResult.data);
        }

        // Fetch forecast data
        const forecastResponse = await fetch(
          `/api/market/forecast/${selectedSymbol}`
        );
        if (forecastResponse.ok) {
          const forecastResult = await forecastResponse.json();
          setForecastData(forecastResult.data);
        }

        // Fetch seasonal data
        const seasonalResponse = await fetch(
          `/api/market/seasonal/${selectedSymbol}`
        );
        if (seasonalResponse.ok) {
          const seasonalResult = await seasonalResponse.json();
          setSeasonalData(seasonalResult.data);
        }

        // Fetch financials data
        const financialsResponse = await fetch(
          `/api/market/financials/${selectedSymbol}`
        );
        if (financialsResponse.ok) {
          const financialsResult = await financialsResponse.json();
          setFinancialData(financialsResult.data);
        }
      } catch (err) {
        console.error("Error fetching symbol data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load symbol data"
        );
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation
        activeSection={selectedSymbol ? undefined : activeSection}
        onSectionChange={handleSectionChange}
        onSymbolSelect={(symbol) => {
          setSelectedSymbol(symbol);
          setActiveTab("overview");
          setActiveSection("home");
        }}
      />

      <div className="max-w-7xl xl:max-w-[1400px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">

        {/* Symbol Detail Section */}
        {selectedSymbol && (
          <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-10">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner
                  size="lg"
                  message={`Loading ${selectedSymbol}...`}
                />
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-12">
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 max-w-md mx-auto">
                  <h2 className="text-xl font-semibold mb-2">
                    Error Loading Symbol
                  </h2>
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
                <TabNavigation
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />

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
                    <TechnicalIndicatorsDisplay
                      indicators={technicalIndicators}
                    />
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

        {/* Dashboard when no symbol selected */}
        {!selectedSymbol && (
          <div className="mt-6 sm:mt-8 md:mt-12 lg:mt-14">
            <DashboardContent
              onSymbolClick={(symbol) => {
                setSelectedSymbol(symbol);
                setActiveTab("overview");
                setActiveSection("home");
              }}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

/** Dashboard content rendered when no symbol is selected */
function DashboardContent({
  onSymbolClick,
}: {
  onSymbolClick: (symbol: string) => void;
}) {
  return (
    <>
      <div id="section-home">
        <FearGreedGauge />
        <div className="mt-6 sm:mt-8 lg:mt-10">
          <WorldMarkets />
        </div>
      </div>
      <div id="section-sectors" className="mt-6 sm:mt-8 lg:mt-10">
        <SectorHub />
      </div>
      <LazySection id="section-heatmaps" className="mt-6 sm:mt-8 lg:mt-10">
        <HeatmapHub refreshInterval={60000} onSymbolClick={onSymbolClick} />
      </LazySection>
      <LazySection id="section-screener" className="mt-6 sm:mt-8 lg:mt-10">
        <ScreenerHub onSymbolClick={onSymbolClick} />
      </LazySection>
      <LazySection id="section-calendars" className="mt-6 sm:mt-8 lg:mt-10">
        <CalendarHub onSymbolClick={onSymbolClick} />
      </LazySection>
    </>
  );
}
