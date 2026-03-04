/**
 * CNN Dataviz API Client
 * Handles Fear & Greed Index, world markets, and economic calendar data
 */

import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import { retryWithBackoff } from "@/lib/retry";
import { FearGreedData, MarketIndex, EconomicEvent } from "@/types";

export class CNNApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.apis.cnnDatavizUrl;
  }

  /**
   * Fetch Fear & Greed Index
   */
  async getFearGreedIndex(): Promise<FearGreedData> {
    return retryWithBackoff(
      async () => {
        try {
          const response = await fetch(`${this.baseUrl}/fear-and-greed`, {
            headers: {
              "Accept": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`CNN API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          return this.parseFearGreedResponse(data);
        } catch (error) {
          logger.error("Failed to fetch Fear & Greed Index", error as Error, {
            baseUrl: this.baseUrl,
          });
          throw error;
        }
      },
      "CNN:FearGreedIndex"
    );
  }

  /**
   * Fetch world markets data
   */
  async getWorldMarkets(): Promise<MarketIndex[]> {
    return retryWithBackoff(
      async () => {
        try {
          const response = await fetch(`${this.baseUrl}/world-markets`, {
            headers: {
              "Accept": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`CNN API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          return this.parseWorldMarketsResponse(data);
        } catch (error) {
          logger.error("Failed to fetch world markets", error as Error, {
            baseUrl: this.baseUrl,
          });
          throw error;
        }
      },
      "CNN:WorldMarkets"
    );
  }

  /**
   * Fetch economic calendar events
   */
  async getEconomicEvents(
    country?: string,
    importance?: "high" | "medium" | "low"
  ): Promise<EconomicEvent[]> {
    return retryWithBackoff(
      async () => {
        try {
          const params = new URLSearchParams();
          if (country) params.append("country", country);
          if (importance) params.append("importance", importance);

          const url = `${this.baseUrl}/economic-events${params.toString() ? `?${params.toString()}` : ""}`;
          
          const response = await fetch(url, {
            headers: {
              "Accept": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`CNN API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          return this.parseEconomicEventsResponse(data);
        } catch (error) {
          logger.error("Failed to fetch economic events", error as Error, {
            baseUrl: this.baseUrl,
            country,
            importance,
          });
          throw error;
        }
      },
      "CNN:EconomicEvents"
    );
  }

  /**
   * Parse Fear & Greed Index response
   */
  private parseFearGreedResponse(data: any): FearGreedData {
    const value = data.fear_and_greed?.score || data.score || 50;
    
    let label: FearGreedData["label"];
    if (value <= 25) label = "Extreme Fear";
    else if (value <= 45) label = "Fear";
    else if (value <= 55) label = "Neutral";
    else if (value <= 75) label = "Greed";
    else label = "Extreme Greed";

    const history = (data.fear_and_greed?.history || data.history || []).map((item: any) => ({
      date: new Date(item.date || item.timestamp),
      value: item.score || item.value,
    }));

    return {
      value,
      label,
      timestamp: new Date(data.timestamp || Date.now()),
      history,
    };
  }

  /**
   * Parse world markets response
   */
  private parseWorldMarketsResponse(data: any): MarketIndex[] {
    const markets = data.markets || data.indices || [];
    
    return markets.map((market: any) => {
      let region: MarketIndex["region"] = "Americas";
      
      // Determine region based on market name or symbol
      const name = (market.name || "").toLowerCase();
      const symbol = (market.symbol || "").toLowerCase();
      
      if (name.includes("asia") || name.includes("nikkei") || name.includes("hang seng") || 
          symbol.includes("hsi") || symbol.includes("nikkei")) {
        region = "Asia-Pacific";
      } else if (name.includes("europe") || name.includes("ftse") || name.includes("dax") || 
                 symbol.includes("ftse") || symbol.includes("dax")) {
        region = "Europe";
      }

      return {
        name: market.name || market.indexName,
        symbol: market.symbol || market.ticker,
        value: parseFloat(market.value || market.price || 0),
        change: parseFloat(market.change || market.changeAmount || 0),
        changePercent: parseFloat(market.changePercent || market.changePct || 0),
        region,
      };
    });
  }

  /**
   * Parse economic events response
   */
  private parseEconomicEventsResponse(data: any): EconomicEvent[] {
    const events = data.events || data.calendar || [];
    
    return events.map((event: any, index: number) => ({
      id: event.id || `event-${index}`,
      name: event.name || event.title || event.event,
      country: event.country || "US",
      date: new Date(event.date || event.timestamp),
      time: event.time,
      importance: event.importance || "medium",
      description: event.description || event.details || "",
      previous: event.previous,
      forecast: event.forecast || event.estimate,
      actual: event.actual,
    }));
  }
}

// Export singleton instance
export const cnnApiService = new CNNApiService();
