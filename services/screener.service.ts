/**
 * Screener Service
 * Implements filter matching logic for the Asset Screener
 */

import type {
  ScreenerFilter,
  ScreenerResult,
  ScreenerPreset,
  ValuationContext,
} from "@/types";
import { marketDataService } from "@/services/market-data.service";

export class ScreenerService {
  /**
   * Check if a single result matches a single filter.
   * Returns false for missing/undefined fields or invalid operators.
   */
  matchesFilter(result: ScreenerResult, filter: ScreenerFilter): boolean {
    const fieldValue = this.getFieldValue(result, filter.field);

    if (fieldValue === undefined || fieldValue === null) {
      return false;
    }

    switch (filter.operator) {
      case "gt":
        return typeof fieldValue === "number" && fieldValue > (filter.value as number);
      case "lt":
        return typeof fieldValue === "number" && fieldValue < (filter.value as number);
      case "eq":
        return fieldValue === filter.value;
      case "gte":
        return typeof fieldValue === "number" && fieldValue >= (filter.value as number);
      case "lte":
        return typeof fieldValue === "number" && fieldValue <= (filter.value as number);
      case "between": {
        if (
          typeof fieldValue !== "number" ||
          !Array.isArray(filter.value) ||
          filter.value.length !== 2
        ) {
          return false;
        }
        const [min, max] = filter.value as [number, number];
        return fieldValue >= min && fieldValue <= max;
      }
      case "in": {
        if (!Array.isArray(filter.value)) {
          return false;
        }
        return (filter.value as (string | number)[]).includes(fieldValue as string | number);
      }
      default:
        return false;
    }
  }

  /**
   * Check if a result matches ALL filters (AND logic).
   * Returns true if filters array is empty.
   */
  matchesAllFilters(
    result: ScreenerResult,
    filters: ScreenerFilter[],
  ): boolean {
    return filters.every((filter) => this.matchesFilter(result, filter));
  }

  /**
   * Filter an array of results, returning only those matching ALL filters.
   */
  filterResults(
    results: ScreenerResult[],
    filters: ScreenerFilter[],
  ): ScreenerResult[] {
    if (filters.length === 0) {
      return results;
    }
    return results.filter((result) => this.matchesAllFilters(result, filters));
  }

  /**
   * Determine valuation context based on P/E, P/B, and PEG ratios.
   * - overpriced: P/E > 30 OR P/B > 5 OR PEG > 2
   * - underpriced: P/E < 15 AND P/B < 1.5 AND PEG < 1
   * - fair: everything else or missing metrics
   */
  calculateValuationContext(result: ScreenerResult): ValuationContext {
    const { peRatio, pbRatio, pegRatio } = result;

    const hasPE = peRatio !== undefined && peRatio !== null;
    const hasPB = pbRatio !== undefined && pbRatio !== null;
    const hasPEG = pegRatio !== undefined && pegRatio !== null;

    if (!hasPE && !hasPB && !hasPEG) {
      return "fair";
    }

    if (
      (hasPE && peRatio > 30) ||
      (hasPB && pbRatio > 5) ||
      (hasPEG && pegRatio > 2)
    ) {
      return "overpriced";
    }

    if (
      hasPE &&
      peRatio < 15 &&
      hasPB &&
      pbRatio < 1.5 &&
      hasPEG &&
      pegRatio < 1
    ) {
      return "underpriced";
    }

    return "fair";
  }

  /**
   * Fetch asset data from the market data service, apply filters,
   * and calculate valuation context for each result.
   */
  async fetchScreenerData(
    filters: ScreenerFilter[],
  ): Promise<ScreenerResult[]> {
    const stocks = await marketDataService.getStockPerformance();

    const results: ScreenerResult[] = stocks.map((stock) => {
      const result: ScreenerResult = {
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        price: stock.price,
        changePercent: stock.changePercent,
        volume: stock.volume ?? 0,
        marketCap: stock.marketCap ?? 0,
        peRatio: stock.peRatio,
        pbRatio: stock.pbRatio,
        pegRatio: stock.pegRatio,
        dividendYield: stock.dividendYield,
        revenueGrowth: stock.revenueGrowth,
        earningsGrowth: stock.earningsGrowth,
        valuationContext: "fair",
        matchScore: 0,
      };

      result.valuationContext = this.calculateValuationContext(result);
      return result;
    });

    return this.filterResults(results, filters);
  }

  /**
   * Return the 7 default screener presets.
   */
  getDefaultPresets(): ScreenerPreset[] {
    const now = new Date();
    return [
      {
        id: "most-active-penny-stocks",
        name: "Most Active Penny Stocks",
        description: "Stocks under $5 with high trading volume",
        filters: [
          { field: "price", operator: "lt", value: 5, label: "Price < $5" },
          {
            field: "volume",
            operator: "gte",
            value: 1_000_000,
            label: "Volume >= 1M",
          },
        ],
        isDefault: true,
        createdAt: now,
      },
      {
        id: "undervalued-growth-stocks",
        name: "Undervalued Growth Stocks",
        description: "Low P/E with strong earnings growth",
        filters: [
          { field: "peRatio", operator: "lt", value: 15, label: "P/E < 15" },
          {
            field: "earningsGrowth",
            operator: "gt",
            value: 10,
            label: "Earnings Growth > 10%",
          },
        ],
        isDefault: true,
        createdAt: now,
      },
      {
        id: "day-gainers",
        name: "Day Gainers",
        description: "Stocks with the highest daily gains",
        filters: [
          {
            field: "changePercent",
            operator: "gt",
            value: 3,
            label: "Change > 3%",
          },
        ],
        isDefault: true,
        createdAt: now,
      },
      {
        id: "most-shorted-stocks",
        name: "Most Shorted Stocks",
        description: "Heavily shorted stocks with high volume",
        filters: [
          {
            field: "volume",
            operator: "gte",
            value: 5_000_000,
            label: "Volume >= 5M",
          },
          {
            field: "changePercent",
            operator: "lt",
            value: 0,
            label: "Change < 0%",
          },
        ],
        isDefault: true,
        createdAt: now,
      },
      {
        id: "undervalued-large-caps",
        name: "Undervalued Large Caps",
        description: "Large cap stocks with low valuation ratios",
        filters: [
          {
            field: "marketCap",
            operator: "gte",
            value: 10_000_000_000,
            label: "Market Cap >= $10B",
          },
          { field: "peRatio", operator: "lt", value: 20, label: "P/E < 20" },
        ],
        isDefault: true,
        createdAt: now,
      },
      {
        id: "aggressive-small-caps",
        name: "Aggressive Small Caps",
        description: "Small cap stocks with high growth potential",
        filters: [
          {
            field: "marketCap",
            operator: "lt",
            value: 2_000_000_000,
            label: "Market Cap < $2B",
          },
          {
            field: "changePercent",
            operator: "gt",
            value: 1,
            label: "Change > 1%",
          },
        ],
        isDefault: true,
        createdAt: now,
      },
      {
        id: "high-dividend-yield",
        name: "High Dividend Yield",
        description: "Stocks with above-average dividend yields",
        filters: [
          {
            field: "dividendYield",
            operator: "gt",
            value: 3,
            label: "Dividend Yield > 3%",
          },
        ],
        isDefault: true,
        createdAt: now,
      },
    ];
  }

  /**
   * Resolve a field name to its value on a ScreenerResult.
   */
  private getFieldValue(
    result: ScreenerResult,
    field: string,
  ): string | number | undefined {
    const value = (result as Record<string, unknown>)[field];
    if (typeof value === "string" || typeof value === "number") {
      return value;
    }
    return undefined;
  }
}

// Export singleton instance
export const screenerService = new ScreenerService();
