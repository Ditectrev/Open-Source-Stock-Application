"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import {
  DNA_BODY,
  DNA_BODY_SECONDARY,
  DNA_CAPTION,
  DNA_EYEBROW,
  DNA_SUBHEADING,
} from "@/lib/design-dna";
import {
  AI_RANKING_TIMEFRAMES,
  type AIRankingTimeframe,
} from "@/lib/ai-stock-rankings";
import type { AIStockRankingsResult, PricingTier } from "@/types";
import { getAiSubscriptionGateMessage } from "@/lib/ai-subscription-ux";
import { ConfidenceInfoTooltip } from "@/components/ConfidenceInfoTooltip";
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

function RankedStockCard({
  rank,
  symbol,
  name,
  confidence,
  rationale,
}: {
  rank: number;
  symbol: string;
  name: string;
  confidence: number;
  rationale: string[];
}) {
  return (
    <article className="rounded-lg border border-stone-200 border-l-4 border-l-stone-900 bg-stone-100 p-4 dark:border-stone-700 dark:border-l-stone-100 dark:bg-stone-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={DNA_EYEBROW}>Rank #{rank}</p>
          <p className={`mt-1 ${DNA_SUBHEADING}`}>
            <span className="tabular-nums">{symbol}</span>
            <span className={`font-normal ${DNA_CAPTION}`}> · {name}</span>
          </p>
        </div>
      </div>
      <p className={`mt-2 flex items-center ${DNA_CAPTION}`}>
        <span>Confidence {Math.round(confidence * 100)}%</span>
        <ConfidenceInfoTooltip variant="stockOfTheDay" />
      </p>
      <p className={`mt-3 ${DNA_BODY}`}>{rationale.join(" ")}</p>
    </article>
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
              <ol className="grid grid-cols-1 gap-4">
                {data.stocks.map((stock) => (
                  <li key={`${timeframe}-${stock.symbol}`}>
                    <RankedStockCard
                      rank={stock.rank}
                      symbol={stock.symbol}
                      name={stock.name}
                      confidence={stock.confidence}
                      rationale={stock.rationale}
                    />
                  </li>
                ))}
              </ol>
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
