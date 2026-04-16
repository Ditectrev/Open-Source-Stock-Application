"use client";

import Link from "next/link";
import type { AIPredictionReport } from "@/types";

interface AIPredictionPanelProps {
  prediction: AIPredictionReport | null;
  loading: boolean;
  locked: boolean;
}

function RecommendationBadge({
  recommendation,
}: {
  recommendation: AIPredictionReport["recommendation"];
}) {
  const styles =
    recommendation === "buy"
      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
      : recommendation === "sell"
        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles}`}
    >
      {recommendation.toUpperCase()}
    </span>
  );
}

export function AIPredictionPanel({
  prediction,
  loading,
  locked,
}: AIPredictionPanelProps) {
  return (
    <section className="mt-6">
      <div className="p-4 sm:p-6 rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
        <div
          className={locked ? "blur-sm select-none pointer-events-none" : ""}
        >
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              AI Prediction
            </h2>
            {prediction && (
              <div className="flex items-center gap-2">
                <RecommendationBadge
                  recommendation={prediction.recommendation}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Confidence {Math.round(prediction.confidence * 100)}%
                </span>
              </div>
            )}
          </div>

          {loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generating AI prediction...
            </p>
          )}

          {!loading && prediction && (
            <div className="space-y-4 text-sm">
              <p className="text-gray-700 dark:text-gray-200">
                {prediction.summary}
              </p>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Political Context
                </h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  {prediction.politicalFactors.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Financial Trends
                </h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  {prediction.financialTrendFactors.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Geopolitical Signals
                </h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  {prediction.geopoliticalFactors.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-gray-900/70 px-6 text-center">
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
              AI prediction is available only for AI subscriptions.
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              Upgrade to unlock
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
