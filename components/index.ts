/**
 * Component exports
 * Central export point for all chart and visualization components
 */

export { ChartWrapper, getDefaultChartOptions } from "./ChartWrapper";
export type { ChartWrapperProps, IChartApi, ISeriesApi, LineData, CandlestickData } from "./ChartWrapper";

export { ChartComponent } from "./ChartComponent";
export type { ChartComponentProps } from "./ChartComponent";

export { TechnicalIndicatorOverlay, calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateBollingerBands } from "./TechnicalIndicatorOverlay";
export type { TechnicalIndicatorOverlayProps } from "./TechnicalIndicatorOverlay";

export { ChartWithIndicators } from "./ChartWithIndicators";
export type { ChartWithIndicatorsProps } from "./ChartWithIndicators";

export { SearchBar } from "./SearchBar";

export { SymbolHeader } from "./SymbolHeader";
export type { SymbolHeaderProps } from "./SymbolHeader";

export { TabNavigation } from "./TabNavigation";
export type { TabNavigationProps } from "./TabNavigation";

export { OverviewTab } from "./OverviewTab";
export type { OverviewTabProps } from "./OverviewTab";

export { KeyMetrics } from "./KeyMetrics";
export type { KeyMetricsProps } from "./KeyMetrics";
