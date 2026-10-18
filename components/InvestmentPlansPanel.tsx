"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AiFeatureErrorNotice } from "@/components/AiFeatureErrorNotice";
import { InvestmentAllocationChart } from "@/components/InvestmentAllocationChart";
import { InsightPanel, InsightPanelHeader } from "@/components/InsightPanel";
import { SubscriptionGate } from "@/components/ProductShell";
import { getAiSubscriptionGateMessage } from "@/lib/ai-subscription-ux";
import {
  DNA_BODY,
  DNA_BODY_SECONDARY,
  DNA_CAPTION,
  DNA_EYEBROW,
  DNA_METRIC_COMPACT,
  DNA_SUBHEADING,
} from "@/lib/design-dna";
import {
  allocationSliceColor,
  ASSET_CLASS_LABELS,
  investmentRiskTone,
} from "@/lib/investment-plans";
import { marketChangeTextClass } from "@/lib/market-semantics";
import { HOME_INSTRUMENT_PANEL, HOME_PRIMARY_BUTTON } from "@/lib/home-ui";
import type {
  InvestmentPlan,
  InvestmentPlansResult,
  PricingTier,
} from "@/types";

interface InvestmentPlansPanelProps {
  result: InvestmentPlansResult | null;
  loading: boolean;
  locked: boolean;
  error?: string | null;
  pricingTier?: PricingTier | null;
}

function formatWeight(weight: number): string {
  return Number.isInteger(weight) ? weight.toFixed(0) : weight.toFixed(1);
}

function formatSignedPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function largestHolding(plan: InvestmentPlan): string {
  return plan.holdings.reduce((best, holding) =>
    holding.weight > best.weight ? holding : best
  ).symbol;
}

function RiskMeter({ score, label }: { score: number; label: string }) {
  const tone = investmentRiskTone(score);
  const filled =
    tone === "low"
      ? "bg-emerald-600 dark:bg-emerald-500"
      : tone === "medium"
        ? "bg-stone-500 dark:bg-stone-400"
        : "bg-rose-600 dark:bg-rose-500";

  return (
    <div
      className="flex items-center gap-2"
      aria-label={`Risk score ${score} of 10, ${label}`}
    >
      <span className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={index}
            className={`h-2 w-1.5 rounded-sm ${
              index < score ? filled : "bg-stone-200 dark:bg-stone-700"
            }`}
          />
        ))}
      </span>
      <span className={DNA_CAPTION}>
        {score}/10 · {label}
      </span>
    </div>
  );
}

export function InvestmentPlansPanel({
  result,
  loading,
  locked,
  error,
  pricingTier,
}: InvestmentPlansPanelProps) {
  const plans = result?.plans ?? [];
  const [planId, setPlanId] = useState(plans[0]?.id ?? "defensive");
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
  const selected = plans.find((plan) => plan.id === planId) ?? plans[0] ?? null;
  const shownSymbol =
    selected &&
    activeSymbol &&
    selected.holdings.some((h) => h.symbol === activeSymbol)
      ? activeSymbol
      : selected
        ? largestHolding(selected)
        : null;

  useEffect(() => {
    if (!selected) return;
    setActiveSymbol(largestHolding(selected));
  }, [selected]);

  const showLockedOverlay = locked && Boolean(result);
  const showLockedGateOnly = locked && !result && !loading;
  const gateMessage = getAiSubscriptionGateMessage(pricingTier ?? undefined);

  const shell = (
    <div
      className={`relative ${HOME_INSTRUMENT_PANEL} ${showLockedGateOnly ? "" : "min-h-[8rem]"}`}
      data-testid="investment-plans-panel"
    >
      {showLockedGateOnly ? (
        <SubscriptionGate
          title="Investment plan ideas"
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
            <InsightPanelHeader
              title="Five portfolio ideas"
              subtitle="Pick a plan to see how the model mixes the holdings."
              right={
                result ? (
                  <p className={DNA_CAPTION}>
                    Generated{" "}
                    {new Date(result.generatedAt).toLocaleDateString()}
                  </p>
                ) : undefined
              }
            />

            {loading && (
              <p className={DNA_BODY_SECONDARY}>
                Building five investment plan ideas...
              </p>
            )}

            {!loading && selected && shownSymbol && (
              <div className="space-y-5">
                <div
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5"
                  role="radiogroup"
                  aria-label="Investment Plans"
                >
                  {plans.map((plan) => {
                    const checked = plan.id === selected.id;
                    return (
                      <label
                        key={plan.id}
                        className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                          checked
                            ? "border-stone-900 bg-stone-50 dark:border-stone-100 dark:bg-stone-800"
                            : "border-stone-200 hover:border-stone-400 dark:border-stone-700 dark:hover:border-stone-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name="investment-plan"
                          className="sr-only"
                          checked={checked}
                          onChange={() => setPlanId(plan.id)}
                        />
                        <p className={DNA_EYEBROW}>{plan.riskLabel}</p>
                        <p className={`mt-1 ${DNA_SUBHEADING}`}>{plan.name}</p>
                        <div className="mt-2">
                          <RiskMeter
                            score={plan.riskScore}
                            label={plan.riskLabel}
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    <p className={DNA_BODY}>{selected.summary}</p>
                    {selected.thesis !== selected.summary ? (
                      <p className={DNA_BODY_SECONDARY}>{selected.thesis}</p>
                    ) : null}
                    <InvestmentAllocationChart
                      holdings={selected.holdings}
                      activeSymbol={shownSymbol}
                      onSelectSymbol={setActiveSymbol}
                    />
                  </div>

                  <ul
                    className="space-y-3"
                    aria-label={`${selected.name} holdings`}
                  >
                    {selected.holdings.map((holding, index) => {
                      const selectedHolding = holding.symbol === shownSymbol;
                      return (
                        <li
                          key={holding.symbol}
                          className={`rounded-lg border p-3 ${
                            selectedHolding
                              ? "border-stone-900 dark:border-stone-100"
                              : "border-stone-200 dark:border-stone-700"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-600 dark:focus-visible:ring-stone-300"
                              aria-pressed={selectedHolding}
                              onClick={() => setActiveSymbol(holding.symbol)}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor:
                                      allocationSliceColor(index),
                                  }}
                                  aria-hidden="true"
                                />
                                <span className={DNA_SUBHEADING}>
                                  {holding.symbol}
                                </span>
                                <span className={DNA_CAPTION}>
                                  {ASSET_CLASS_LABELS[holding.assetClass]}
                                </span>
                                <span
                                  className={`ml-auto ${DNA_METRIC_COMPACT}`}
                                >
                                  {formatWeight(holding.weight)}%
                                </span>
                              </span>
                              <span className={`mt-1 block ${DNA_CAPTION}`}>
                                {holding.name}
                              </span>
                              <span
                                className="mt-2 block h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700"
                                aria-hidden="true"
                              >
                                <span
                                  className="block h-full rounded-full"
                                  style={{
                                    width: `${holding.weight}%`,
                                    backgroundColor:
                                      allocationSliceColor(index),
                                  }}
                                />
                              </span>
                              {holding.rationale ? (
                                <span className={`mt-2 block ${DNA_BODY}`}>
                                  {holding.rationale}
                                </span>
                              ) : null}
                              <span
                                className={`mt-2 flex flex-wrap gap-x-3 ${DNA_CAPTION}`}
                              >
                                {typeof holding.price === "number" ? (
                                  <span className="tabular-nums">
                                    ${holding.price.toFixed(2)}
                                  </span>
                                ) : null}
                                {typeof holding.changePercent === "number" ? (
                                  <span
                                    className={marketChangeTextClass(
                                      holding.changePercent
                                    )}
                                  >
                                    {formatSignedPercent(holding.changePercent)}{" "}
                                    today
                                  </span>
                                ) : null}
                                {typeof holding.trailingReturnPercent ===
                                "number" ? (
                                  <span
                                    className={marketChangeTextClass(
                                      holding.trailingReturnPercent
                                    )}
                                  >
                                    {formatSignedPercent(
                                      holding.trailingReturnPercent
                                    )}{" "}
                                    over the measured window
                                  </span>
                                ) : null}
                              </span>
                            </button>
                            <Link
                              href={`/?symbol=${encodeURIComponent(holding.symbol)}`}
                              className={`${DNA_CAPTION} underline underline-offset-2`}
                            >
                              Quote
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {!loading && !selected && !locked && error && (
              <AiFeatureErrorNotice
                error={error}
                title="Investment Plans unavailable"
                defaultTone="warning"
              />
            )}

            {!loading && !selected && !locked && !error && (
              <p className={DNA_BODY_SECONDARY}>
                No investment plan ideas yet. Refresh to try again.
              </p>
            )}
          </div>

          {showLockedOverlay && (
            <SubscriptionGate
              title="Investment plan ideas"
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

  return <InsightPanel>{shell}</InsightPanel>;
}
