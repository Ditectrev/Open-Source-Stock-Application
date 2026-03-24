/**
 * Economic Calendar Fallback Service
 * Uses FairEconomy (ForexFactory) as a free, no-key-required source
 * for current economic calendar data when CNN is unavailable.
 */

import { logger } from "@/lib/logger";
import { retryWithBackoff } from "@/lib/retry";
import { EconomicEvent } from "@/types";

const CALENDAR_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";

const IMPACT_MAP: Record<string, "high" | "medium" | "low"> = {
  High: "high",
  Medium: "medium",
  Low: "low",
  Holiday: "low",
  "Non-Economic": "low",
};

const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: "US",
  GBP: "UK",
  EUR: "EU",
  JPY: "JP",
  CNY: "CN",
  CAD: "CA",
  AUD: "AU",
  NZD: "NZ",
  CHF: "CH",
};

export class EconomicCalendarFallbackService {
  async getEconomicEvents(
    country?: string,
    importance?: "high" | "medium" | "low"
  ): Promise<EconomicEvent[]> {
    return retryWithBackoff(
      async () => {
        try {
          const response = await fetch(CALENDAR_URL, {
            headers: { Accept: "application/json" },
          });

          if (!response.ok) {
            throw new Error(
              `FairEconomy API error: ${response.status} ${response.statusText}`
            );
          }

          const data = await response.json();
          return this.parseResponse(data, country, importance);
        } catch (error) {
          logger.error(
            "Failed to fetch economic events from FairEconomy",
            error as Error
          );
          throw error;
        }
      },
      "FairEconomy:Calendar",
      { maxAttempts: 1 }
    );
  }

  private parseResponse(
    data: any[],
    country?: string,
    importance?: "high" | "medium" | "low"
  ): EconomicEvent[] {
    if (!Array.isArray(data)) return [];

    let events = data.map((item: any, index: number) => {
      const eventDate = new Date(item.date);
      const countryCode = CURRENCY_TO_COUNTRY[item.country] || item.country;

      return {
        id: `ff-${index}-${eventDate.getTime()}`,
        name: item.title || "Unknown Event",
        country: countryCode,
        date: eventDate,
        time: eventDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        importance: IMPACT_MAP[item.impact] || "low",
        description: item.title || "",
        previous: item.previous || undefined,
        forecast: item.forecast || undefined,
        actual: item.actual || undefined,
      };
    });

    if (country) {
      events = events.filter((e) => e.country === country);
    }
    if (importance) {
      events = events.filter((e) => e.importance === importance);
    }

    return events;
  }
}

export const tradingEconomicsService = new EconomicCalendarFallbackService();
