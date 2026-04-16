"use client";

import Link from "next/link";
import type { StockOfTheDay } from "@/types";

interface StockOfTheDayPanelProps {
  item: StockOfTheDay | null;
  loading: boolean;
  locked: boolean;
}

export function StockOfTheDayPanel({
  item,
  loading,
  locked,
}: StockOfTheDayPanelProps) {
  return (
    <section className="mt-6 sm:mt-8 lg:mt-10">
      <div className="p-4 sm:p-6 rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
        <div
          className={locked ? "blur-sm select-none pointer-events-none" : ""}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Stock of the day
            </h2>
            {item && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Confidence {Math.round(item.confidence * 100)}%
              </span>
            )}
          </div>

          {loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Computing today&apos;s top pick...
            </p>
          )}

          {!loading && item && (
            <div className="space-y-3">
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {item.symbol} - {item.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Recommendation:{" "}
                <span className="font-semibold uppercase">
                  {item.recommendation}
                </span>
              </p>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {item.rationale.map((reason) => (
                  <li key={reason}>- {reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-gray-900/70 px-6 text-center">
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
              AI section locked. Enable any AI subscription to reveal
              today&apos;s pick.
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              View AI plans
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
