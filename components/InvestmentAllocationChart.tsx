"use client";

import { useState } from "react";
import {
  DNA_CAPTION,
  DNA_EYEBROW,
  DNA_METRIC,
  DNA_SUBHEADING,
} from "@/lib/design-dna";
import {
  allocationByClass,
  allocationSliceColor,
  ASSET_CLASS_COLORS,
  ASSET_CLASS_LABELS,
} from "@/lib/investment-plans";
import type { InvestmentAssetClass, InvestmentPlanHolding } from "@/types";

const SIZE = 220;
const STROKE = 28;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2;

function formatWeight(weight: number): string {
  return Number.isInteger(weight) ? weight.toFixed(0) : weight.toFixed(1);
}

interface InvestmentAllocationChartProps {
  holdings: InvestmentPlanHolding[];
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export function InvestmentAllocationChart({
  holdings,
  activeSymbol,
  onSelectSymbol,
}: InvestmentAllocationChartProps) {
  const [previewSymbol, setPreviewSymbol] = useState<string | null>(null);
  const shownSymbol = previewSymbol ?? activeSymbol;
  const active =
    holdings.find((holding) => holding.symbol === shownSymbol) ?? holdings[0];
  const classes = allocationByClass(holdings);

  let cursor = 0;
  const slices = holdings.map((holding, index) => {
    const start = cursor;
    cursor += holding.weight;
    return { holding, index, start };
  });

  const selectClass = (assetClass: InvestmentAssetClass) => {
    const match = holdings
      .filter((holding) => holding.assetClass === assetClass)
      .sort((a, b) => b.weight - a.weight)[0];
    if (match) onSelectSymbol(match.symbol);
  };

  return (
    <div className="space-y-5" data-testid="investment-allocation-chart">
      <div>
        <p className={DNA_EYEBROW}>Asset mix</p>
        <div
          className="mt-2 flex h-3 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700"
          role="group"
          aria-label="Allocation by asset class"
        >
          {classes.map((item) => (
            <button
              key={item.assetClass}
              type="button"
              className="h-full min-w-[4px] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-600 focus-visible:ring-offset-2 dark:focus-visible:ring-stone-300"
              style={{
                width: `${item.weight}%`,
                backgroundColor: ASSET_CLASS_COLORS[item.assetClass],
              }}
              aria-label={`${ASSET_CLASS_LABELS[item.assetClass]} ${formatWeight(item.weight)} percent`}
              onClick={() => selectClass(item.assetClass)}
            />
          ))}
        </div>
        <ul className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 ${DNA_CAPTION}`}>
          {classes.map((item) => (
            <li key={item.assetClass} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: ASSET_CLASS_COLORS[item.assetClass] }}
                aria-hidden="true"
              />
              {ASSET_CLASS_LABELS[item.assetClass]} {formatWeight(item.weight)}%
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative h-[220px] w-[220px] shrink-0">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="-rotate-90"
            role="group"
            aria-label="Holdings allocation"
          >
            {slices.map(({ holding, index, start }) => {
              const length = Math.max(
                (holding.weight / 100) * CIRCUMFERENCE - GAP,
                1
              );
              const selected = holding.symbol === active?.symbol;
              return (
                <circle
                  key={holding.symbol}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={allocationSliceColor(index)}
                  strokeWidth={selected ? STROKE + 8 : STROKE}
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={-((start / 100) * CIRCUMFERENCE)}
                  className="cursor-pointer transition-all"
                  role="button"
                  tabIndex={0}
                  aria-pressed={holding.symbol === activeSymbol}
                  aria-label={`${holding.symbol} ${formatWeight(holding.weight)} percent`}
                  data-active={
                    holding.symbol === activeSymbol ? "true" : "false"
                  }
                  onMouseEnter={() => setPreviewSymbol(holding.symbol)}
                  onMouseLeave={() => setPreviewSymbol(null)}
                  onClick={() => {
                    setPreviewSymbol(null);
                    onSelectSymbol(holding.symbol);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectSymbol(holding.symbol);
                    }
                  }}
                />
              );
            })}
          </svg>
          {active ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className={DNA_METRIC}>{formatWeight(active.weight)}%</p>
              <p className={DNA_SUBHEADING}>{active.symbol}</p>
              <p className={DNA_CAPTION}>
                {ASSET_CLASS_LABELS[active.assetClass]}
              </p>
            </div>
          ) : null}
        </div>

        <ul className="w-full space-y-1.5" aria-label="Allocation legend">
          {holdings.map((holding, index) => {
            const selected = holding.symbol === activeSymbol;
            return (
              <li key={holding.symbol}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-600 dark:focus-visible:ring-stone-300 ${
                    selected
                      ? "bg-stone-100 dark:bg-stone-800"
                      : "hover:bg-stone-50 dark:hover:bg-stone-800/60"
                  }`}
                  aria-pressed={selected}
                  onMouseEnter={() => setPreviewSymbol(holding.symbol)}
                  onMouseLeave={() => setPreviewSymbol(null)}
                  onClick={() => {
                    setPreviewSymbol(null);
                    onSelectSymbol(holding.symbol);
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: allocationSliceColor(index) }}
                    aria-hidden="true"
                  />
                  <span className={`min-w-0 flex-1 truncate ${DNA_CAPTION}`}>
                    <span className="font-semibold text-stone-900 dark:text-stone-50">
                      {holding.symbol}
                    </span>
                  </span>
                  <span className={`${DNA_CAPTION} tabular-nums`}>
                    {formatWeight(holding.weight)}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
