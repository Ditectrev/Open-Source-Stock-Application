"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import {
  DNA_BODY,
  DNA_BODY_SECONDARY,
  DNA_CAPTION,
  DNA_LABEL_STRONG,
} from "@/lib/design-dna";
import {
  AI_RANKING_TIMEFRAMES,
  type AIRankingTimeframe,
} from "@/lib/ai-stock-rankings";
import type { AIStockRankingsResult, PricingTier } from "@/types";
import { getAiSubscriptionGateMessage } from "@/lib/ai-subscription-ux";
import { InsightPanel, InsightPanelHeader } from "@/components/InsightPanel";
import { SubscriptionGate } from "@/components/ProductShell";
import { AiFeatureErrorNotice } from "@/components/AiFeatureErrorNotice";
import {
  HOME_INSTRUMENT_PANEL,
  HOME_PRIMARY_BUTTON,
  HOME_SEGMENTED_NAV,
  homeSegmentedTabClasses,
} from "@/lib/home-ui";
import { useTheme } from "@/lib/theme-context";

interface AIStockRankingsPanelProps {
  data: AIStockRankingsResult | null;
  loading: boolean;
  locked: boolean;
  error?: string | null;
  pricingTier?: PricingTier | null;
  timeframe: AIRankingTimeframe;
  onTimeframeChange: (timeframe: AIRankingTimeframe) => void;
}

function formatRankingRationale(rationale: string[]): string {
  return rationale.filter(Boolean).join(" ");
}

export function AIStockRankingsPanel({
  data,
  loading,
  locked,
  error,
  pricingTier,
  timeframe,
  onTimeframeChange,
}: AIStockRankingsPanelProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const showLockedOverlay = locked && Boolean(data);
  const showLockedGateOnly = locked && !data && !loading;
  const gateMessage = getAiSubscriptionGateMessage(pricingTier ?? undefined);
  const activeHorizon =
    AI_RANKING_TIMEFRAMES.find((item) => item.id === timeframe)?.horizon ??
    "Days to weeks";

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let nextIndex: number | null = null;

      switch (e.key) {
        case "ArrowRight":
          nextIndex = (index + 1) % AI_RANKING_TIMEFRAMES.length;
          break;
        case "ArrowLeft":
          nextIndex =
            (index - 1 + AI_RANKING_TIMEFRAMES.length) %
            AI_RANKING_TIMEFRAMES.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = AI_RANKING_TIMEFRAMES.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      onTimeframeChange(AI_RANKING_TIMEFRAMES[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    },
    [onTimeframeChange]
  );

  const shell = (
    <div
      className={`relative ${HOME_INSTRUMENT_PANEL} ${showLockedGateOnly ? "" : "min-h-[8rem]"}`}
      data-testid="ranking-panel"
    >
      {showLockedGateOnly ? (
        <SubscriptionGate
          title="Ranking"
          message={gateMessage}
          ctaHref="/pricing"
          ctaLabel="View AI plans"
          buttonClassName={HOME_PRIMARY_BUTTON}
        />
      ) : (
        <>
          <div
            className={
              showLockedOverlay ? "blur-sm select-none pointer-events-none" : ""
            }
          >
            <div className="text-stone-900 dark:text-stone-100">
              <InsightPanelHeader
                title="Most promising stocks"
                subtitle={`Top AI-ranked ideas for the ${activeHorizon.toLowerCase()} horizon.`}
                right={
                  data ? (
                    <p className={DNA_CAPTION}>
                      Generated{" "}
                      {new Date(data.generatedAt).toLocaleDateString()}
                    </p>
                  ) : undefined
                }
              />
            </div>

            <nav
              className={`${HOME_SEGMENTED_NAV} mb-4`}
              role="tablist"
              aria-label="Ranking time frames"
            >
              {AI_RANKING_TIMEFRAMES.map((item, index) => {
                const isActive = timeframe === item.id;
                return (
                  <button
                    key={item.id}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    type="button"
                    onClick={() => onTimeframeChange(item.id)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    className={`flex flex-col items-start px-3 py-2 text-left sm:flex-row sm:items-center sm:gap-2 ${homeSegmentedTabClasses(isActive, isDark)}`}
                    data-testid={`ranking-timeframe-${item.id}`}
                  >
                    <span>{item.label}</span>
                    <span className={`${DNA_CAPTION} hidden sm:inline`}>
                      {item.horizon}
                    </span>
                  </button>
                );
              })}
            </nav>

            <p className={`mb-4 ${DNA_CAPTION}`} data-testid="ranking-horizon">
              Horizon: {activeHorizon}
            </p>

            {loading && (
              <p className={DNA_BODY_SECONDARY}>
                Ranking stocks for the {activeHorizon.toLowerCase()} horizon...
              </p>
            )}

            {!loading && data && (
              <div
                className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-sm dark:border-stone-700 dark:bg-stone-950"
                data-testid="ranking-table"
              >
                <div className="overflow-x-auto">
                  <table
                    className={`w-full min-w-[640px] ${DNA_BODY}`}
                    aria-label="Ranking results"
                  >
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-900">
                        <th
                          scope="col"
                          className="w-16 px-3 py-2 text-left font-medium text-stone-900 md:px-4 md:py-3 dark:text-stone-100"
                        >
                          Rank
                        </th>
                        <th
                          scope="col"
                          className="w-24 px-3 py-2 text-left font-medium text-stone-900 md:px-4 md:py-3 dark:text-stone-100"
                        >
                          Symbol
                        </th>
                        <th
                          scope="col"
                          className="min-w-[10rem] px-3 py-2 text-left font-medium text-stone-900 md:px-4 md:py-3 dark:text-stone-100"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="min-w-[20rem] px-3 py-2 text-left font-medium text-stone-900 md:px-4 md:py-3 dark:text-stone-100"
                        >
                          Why
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.stocks.map((stock) => (
                        <tr
                          key={`${timeframe}-${stock.symbol}`}
                          className="border-b border-stone-200 align-top text-stone-800 transition-colors hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-900"
                          data-testid={`ranking-row-${stock.symbol}`}
                        >
                          <td className="px-3 py-3 tabular-nums md:px-4">
                            <span className={DNA_LABEL_STRONG}>
                              #{stock.rank}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-medium md:px-4">
                            {stock.symbol}
                          </td>
                          <td className="max-w-[12rem] px-3 py-3 md:max-w-none md:px-4">
                            {stock.name}
                          </td>
                          <td className="px-3 py-3 leading-relaxed md:px-4">
                            {formatRankingRationale(stock.rationale)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!loading && !data && !locked && error && (
              <AiFeatureErrorNotice
                error={error}
                title="Ranking unavailable"
                defaultTone="warning"
              />
            )}

            {!loading && !data && !locked && !error && (
              <p className={DNA_BODY_SECONDARY}>
                No ranking result yet. Switch time frames or refresh to try
                again.
              </p>
            )}
          </div>

          {showLockedOverlay && (
            <SubscriptionGate
              title="Ranking"
              message={gateMessage}
              ctaHref="/pricing"
              ctaLabel="View AI plans"
              align="center"
              overlay
              buttonClassName={HOME_PRIMARY_BUTTON}
            />
          )}
        </>
      )}
    </div>
  );

  return (
    <InsightPanel>
      {shell}
      <p className={`mt-4 ${DNA_CAPTION}`}>
        Also see{" "}
        <Link href="/stock-of-the-day" className="underline underline-offset-2">
          Stock of the day
        </Link>{" "}
        for daily buy and sell ideas.
      </p>
    </InsightPanel>
  );
}
