"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { DNA_BODY, DNA_EYEBROW, DNA_LABEL_STRONG } from "@/lib/design-dna";
import {
  AI_RANKING_TIMEFRAMES,
  type AIRankingTimeframe,
} from "@/lib/ai-stock-rankings";
import type {
  AIRankedStock,
  AIStockRankingsResult,
  PricingTier,
} from "@/types";
import { getAiSubscriptionGateMessage } from "@/lib/ai-subscription-ux";
import { InsightPanel, InsightPanelHeader } from "@/components/InsightPanel";
import { SubscriptionGate } from "@/components/ProductShell";
import { AiFeatureErrorNotice } from "@/components/AiFeatureErrorNotice";
import {
  HOME_INSTRUMENT_PANEL,
  HOME_MUTED_TEXT,
  HOME_PRIMARY_BUTTON,
  HOME_SEGMENTED_NAV,
  HOME_SUBTLE_TEXT,
  homeSegmentedTabClasses,
  rankingTabSublabelClasses,
} from "@/lib/home-ui";
import { MARKET_DOWN_TEXT, MARKET_UP_TEXT } from "@/lib/market-semantics";
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

function RankingSideTable({
  title,
  variant,
  stocks,
  timeframe,
}: {
  title: string;
  variant: "buy" | "sell";
  stocks: AIRankedStock[];
  timeframe: AIRankingTimeframe;
}) {
  const borderClass =
    variant === "buy"
      ? "border-l-emerald-600 dark:border-l-emerald-500"
      : "border-l-rose-600 dark:border-l-rose-500";
  const stanceClass = variant === "buy" ? MARKET_UP_TEXT : MARKET_DOWN_TEXT;

  return (
    <section
      className={`overflow-hidden rounded-xl border border-stone-200 border-l-4 bg-stone-50 shadow-sm dark:border-stone-700 dark:bg-stone-950 ${borderClass}`}
      data-testid={`ranking-table-${variant}`}
    >
      <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-700">
        <p className={`${DNA_EYEBROW} ${stanceClass}`}>{title}</p>
      </div>
      <div className="overflow-x-auto">
        <table
          className={`w-full min-w-[520px] ${DNA_BODY}`}
          aria-label={`${title} ranking results`}
        >
          <thead>
            <tr className="border-b border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-900">
              <th
                scope="col"
                className="w-16 px-3 py-2 text-left text-sm font-medium text-stone-800 md:px-4 md:py-3 dark:text-stone-100"
              >
                Rank
              </th>
              <th
                scope="col"
                className="w-24 px-3 py-2 text-left text-sm font-medium text-stone-800 md:px-4 md:py-3 dark:text-stone-100"
              >
                Symbol
              </th>
              <th
                scope="col"
                className="min-w-[10rem] px-3 py-2 text-left text-sm font-medium text-stone-800 md:px-4 md:py-3 dark:text-stone-100"
              >
                Name
              </th>
              <th
                scope="col"
                className="min-w-[16rem] px-3 py-2 text-left text-sm font-medium text-stone-800 md:px-4 md:py-3 dark:text-stone-100"
              >
                Why
              </th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr
                key={`${timeframe}-${variant}-${stock.symbol}`}
                className="border-b border-stone-200 align-top transition-colors hover:bg-stone-100 dark:border-stone-800 dark:hover:bg-stone-900"
                data-testid={`ranking-row-${variant}-${stock.symbol}`}
              >
                <td className="px-3 py-3 tabular-nums text-stone-900 md:px-4 dark:text-stone-50">
                  <span className={DNA_LABEL_STRONG}>#{stock.rank}</span>
                </td>
                <td className="px-3 py-3 font-medium text-stone-900 md:px-4 dark:text-stone-50">
                  {stock.symbol}
                </td>
                <td className="max-w-[12rem] px-3 py-3 text-stone-800 md:max-w-none md:px-4 dark:text-stone-200">
                  {stock.name}
                </td>
                <td className="px-3 py-3 leading-relaxed text-stone-800 md:px-4 dark:text-stone-200">
                  {formatRankingRationale(stock.rationale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
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
                title="Buy and sell rankings"
                subtitle={`Top AI-ranked buy and sell ideas for the ${activeHorizon.toLowerCase()} horizon.`}
                right={
                  data ? (
                    <p className={`text-xs ${HOME_SUBTLE_TEXT}`}>
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
                    <span
                      className={`text-xs hidden sm:inline ${rankingTabSublabelClasses(isActive, isDark)}`}
                    >
                      {item.horizon}
                    </span>
                  </button>
                );
              })}
            </nav>

            <p
              className={`mb-4 text-xs ${HOME_SUBTLE_TEXT}`}
              data-testid="ranking-horizon"
            >
              Horizon: {activeHorizon}
            </p>

            {loading && (
              <p className={HOME_MUTED_TEXT}>
                Ranking buy and sell ideas for the {activeHorizon.toLowerCase()}{" "}
                horizon...
              </p>
            )}

            {!loading && data && (
              <div
                className="grid grid-cols-1 gap-6 xl:grid-cols-2"
                data-testid="ranking-tables"
              >
                <RankingSideTable
                  title="Ideas to buy"
                  variant="buy"
                  stocks={data.buy}
                  timeframe={timeframe}
                />
                <RankingSideTable
                  title="Ideas to sell"
                  variant="sell"
                  stocks={data.sell}
                  timeframe={timeframe}
                />
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
              <p className={HOME_MUTED_TEXT}>
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
      <p className={`mt-4 text-xs ${HOME_SUBTLE_TEXT}`}>
        Also see{" "}
        <Link href="/stock-of-the-day" className="underline underline-offset-2">
          Stock of the day
        </Link>{" "}
        for daily buy and sell ideas.
      </p>
    </InsightPanel>
  );
}
