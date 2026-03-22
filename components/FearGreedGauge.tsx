"use client";

/**
 * FearGreedGauge Component
 * Displays the CNN Fear & Greed Index with a semi-circle gauge visualization,
 * current value, label, historical timeline, and explanatory tooltip.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/lib/theme-context";
import { FearGreedData } from "@/types";

export interface FearGreedGaugeProps {
  data?: FearGreedData;
}

/** Map a 0-100 value to a label */
function getLabel(value: number): FearGreedData["label"] {
  if (value <= 25) return "Extreme Fear";
  if (value <= 45) return "Fear";
  if (value <= 55) return "Neutral";
  if (value <= 75) return "Greed";
  return "Extreme Greed";
}

/** Map a 0-100 value to a color */
function getColor(value: number): string {
  if (value <= 25) return "#dc2626";
  if (value <= 45) return "#f97316";
  if (value <= 55) return "#eab308";
  if (value <= 75) return "#84cc16";
  return "#22c55e";
}

const TOOLTIP_TEXT =
  "The Fear & Greed Index measures market sentiment on a 0-100 scale using seven indicators including market momentum, stock price strength, stock price breadth, put/call options, junk bond demand, market volatility, and safe haven demand.";

export function FearGreedGauge({ data: externalData }: FearGreedGaugeProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [data, setData] = useState<FearGreedData | null>(externalData ?? null);
  const [loading, setLoading] = useState(!externalData);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [historyRange, setHistoryRange] = useState<"1W" | "1M" | "3M" | "1Y" | "5Y" | "Max">("1M");

  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; date: Date } | null>(null);

  const rangeLimits: Record<string, number> = { "1W": 7, "1M": 30, "3M": 90, "1Y": 365, "5Y": 1825, "Max": 0 };

  const fetchData = useCallback(async (limit: number = 30) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/market/fear-greed?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch Fear & Greed data");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Unknown error");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (externalData) {
      setData(externalData);
      setLoading(false);
      return;
    }
    fetchData(rangeLimits[historyRange]);
  }, [externalData, fetchData, historyRange]);

  // --- Loading state ---
  if (loading) {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
        data-testid="fear-greed-loading"
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
        data-testid="fear-greed-error"
      >
        <p className="text-red-500 text-center">{error}</p>
        <button
          onClick={() => fetchData()}
          className="mt-2 mx-auto block text-sm text-blue-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const value = Math.max(0, Math.min(100, data.value));
  const label = data.label ?? getLabel(value);
  const color = getColor(value);

  // Gauge geometry – semi-circle from π to 0 (left to right)
  const cx = 150;
  const cy = 130;
  const r = 100;
  const startAngle = Math.PI; // 180°
  const endAngle = 0; // 0°
  const needleAngle = Math.PI - (value / 100) * Math.PI;

  // Arc helper
  const arcPath = (from: number, to: number, radius: number) => {
    const x1 = cx + radius * Math.cos(from);
    const y1 = cy - radius * Math.sin(from);
    const x2 = cx + radius * Math.cos(to);
    const y2 = cy - radius * Math.sin(to);
    const largeArc = from - to > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Range boundaries (angles in radians, left-to-right)
  const ranges = [
    { from: Math.PI, to: Math.PI * 0.75, color: "#dc2626" }, // Extreme Fear 0-25
    { from: Math.PI * 0.75, to: Math.PI * 0.55, color: "#f97316" }, // Fear 25-45
    { from: Math.PI * 0.55, to: Math.PI * 0.45, color: "#eab308" }, // Neutral 45-55
    { from: Math.PI * 0.45, to: Math.PI * 0.25, color: "#84cc16" }, // Greed 55-75
    { from: Math.PI * 0.25, to: 0, color: "#22c55e" }, // Extreme Greed 75-100
  ];

  // Needle tip
  const needleLen = r - 10;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  // Range labels positioned around the arc
  const rangeLabels = [
    { text: "Extreme Fear", angle: Math.PI * 0.875 },
    { text: "Fear", angle: Math.PI * 0.65 },
    { text: "Neutral", angle: Math.PI * 0.5 },
    { text: "Greed", angle: Math.PI * 0.35 },
    { text: "Extreme Greed", angle: Math.PI * 0.125 },
  ];

  return (
    <div
      className={`p-6 rounded-lg shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
      data-testid="fear-greed-gauge"
    >
      {/* Header with tooltip */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Fear &amp; Greed Index
        </h3>
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            aria-label="What is the Fear and Greed Index?"
            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
              isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            ?
          </button>
          {showTooltip && (
            <div
              role="tooltip"
              className={`absolute right-0 top-8 z-10 w-64 p-3 rounded-lg shadow-lg text-sm ${
                isDark
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-900 text-white"
              }`}
            >
              {TOOLTIP_TEXT}
            </div>
          )}
        </div>
      </div>

      {/* SVG Gauge */}
      <div
        className="flex justify-center"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg
          viewBox="0 0 300 160"
          className="w-full max-w-xs"
          aria-label={`Fear and Greed gauge showing ${value} - ${label}`}
          role="img"
        >
          {/* Colored arc segments */}
          {ranges.map((seg, i) => (
            <path
              key={i}
              d={arcPath(seg.from, seg.to, r)}
              fill="none"
              stroke={seg.color}
              strokeWidth={18}
              strokeLinecap="butt"
            />
          ))}

          {/* Tick marks at 0, 25, 50, 75, 100 */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const a = Math.PI - (tick / 100) * Math.PI;
            const inner = r - 14;
            const outer = r + 14;
            return (
              <line
                key={tick}
                x1={cx + inner * Math.cos(a)}
                y1={cy - inner * Math.sin(a)}
                x2={cx + outer * Math.cos(a)}
                y2={cy - outer * Math.sin(a)}
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                strokeWidth={2}
              />
            );
          })}

          {/* Tick labels */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const a = Math.PI - (tick / 100) * Math.PI;
            const labelR = r + 26;
            return (
              <text
                key={tick}
                x={cx + labelR * Math.cos(a)}
                y={cy - labelR * Math.sin(a) + 4}
                textAnchor="middle"
                fontSize="10"
                fill={isDark ? "#9ca3af" : "#6b7280"}
              >
                {tick}
              </text>
            );
          })}

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={5} fill={color} />
        </svg>
      </div>

      {/* Current value & label */}
      <div className="text-center mt-2">
        <span
          className="text-3xl font-bold"
          style={{ color }}
          data-testid="fear-greed-value"
        >
          {Math.round(value)}
        </span>
        <p
          className={`text-sm font-medium mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}
          data-testid="fear-greed-label"
        >
          {label}
        </p>
      </div>

      {/* Range legend */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {[
          { label: "Extreme Fear", color: "#dc2626" },
          { label: "Fear", color: "#f97316" },
          { label: "Neutral", color: "#eab308" },
          { label: "Greed", color: "#84cc16" },
          { label: "Extreme Greed", color: "#22c55e" },
        ].map((r) => (
          <span
            key={r.label}
            className={`inline-flex items-center gap-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: r.color }}
            />
            {r.label}
          </span>
        ))}
      </div>

      {/* Historical timeline */}
      {data.history && data.history.length > 0 && (
        <div className="mt-6" data-testid="fear-greed-history">
          <div className="flex items-center justify-between mb-2">
            <h4
              className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Historical Timeline
            </h4>
            {!externalData && (
              <div className="flex gap-1" data-testid="fear-greed-range-selector">
                {(["1W", "1M", "3M", "1Y", "5Y", "Max"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setHistoryRange(range)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      historyRange === range
                        ? "bg-blue-600 text-white"
                        : isDark
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative h-64">
            <svg
              viewBox={`0 0 ${Math.max(data.history.length * 4, 100)} 100`}
              className="w-full h-full"
              preserveAspectRatio="none"
              aria-label="Fear and Greed historical timeline"
              role="img"
              onMouseLeave={() => setHoveredPoint(null)}
              onMouseMove={(e) => {
                const svg = e.currentTarget;
                const rect = svg.getBoundingClientRect();
                const relX = (e.clientX - rect.left) / rect.width;
                const idx = Math.round(relX * (data.history.length - 1));
                const clamped = Math.max(0, Math.min(data.history.length - 1, idx));
                const point = data.history[clamped];
                if (point) {
                  // Snap X to the data point's position
                  const snapX = (clamped / Math.max(data.history.length - 1, 1)) * rect.width;
                  // Snap Y to the data value (0 at bottom, 100 at top)
                  const snapY = ((100 - point.value) / 100) * rect.height;
                  setHoveredPoint({
                    x: snapX,
                    y: snapY,
                    value: point.value,
                    date: new Date(point.date),
                  });
                }
              }}
            >
              {/* Background bands (top = 100/Extreme Greed, bottom = 0/Extreme Fear) */}
              <rect x="0" y="0" width="100%" height="25" fill="#22c55e20" />
              <rect x="0" y="25" width="100%" height="20" fill="#84cc1620" />
              <rect x="0" y="45" width="100%" height="10" fill="#eab30820" />
              <rect x="0" y="55" width="100%" height="20" fill="#f9731620" />
              <rect x="0" y="75" width="100%" height="25" fill="#dc262620" />

              {/* Line chart */}
              <polyline
                fill="none"
                stroke={isDark ? "#60a5fa" : "#3b82f6"}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                points={data.history
                  .map((h, i) => {
                    const x =
                      (i / Math.max(data.history.length - 1, 1)) *
                      Math.max(data.history.length * 4, 100);
                    const y = 100 - h.value;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            </svg>

            {/* Hover crosshair lines */}
            {hoveredPoint && (
              <>
                <div
                  className={`absolute top-0 h-full w-px pointer-events-none ${
                    isDark ? "bg-gray-400" : "bg-gray-600"
                  }`}
                  style={{ left: hoveredPoint.x }}
                />
                <div
                  className={`absolute left-0 w-full h-px pointer-events-none ${
                    isDark ? "bg-gray-400" : "bg-gray-600"
                  }`}
                  style={{ top: hoveredPoint.y }}
                />
              </>
            )}

            {/* Hover tooltip */}
            {hoveredPoint && (
              <div
                className={`absolute z-10 px-2 py-1 rounded text-xs shadow-lg pointer-events-none whitespace-nowrap ${
                  isDark ? "bg-gray-700 text-gray-100" : "bg-gray-900 text-white"
                }`}
                style={{
                  left: Math.min(hoveredPoint.x, 200),
                  top: Math.max(hoveredPoint.y - 32, 0),
                }}
                data-testid="fear-greed-chart-tooltip"
              >
                {hoveredPoint.date.toLocaleDateString()} — <span style={{ color: getColor(hoveredPoint.value) }}>{hoveredPoint.value}</span> ({getLabel(hoveredPoint.value)})
              </div>
            )}

            {/* Y-axis labels */}
            <div className="absolute top-0 left-0 h-full flex flex-col justify-between pointer-events-none">
              <span
                className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                100
              </span>
              <span
                className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                0
              </span>
            </div>
          </div>
          {/* Date range */}
          <div className="flex justify-between mt-1">
            <span
              className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              {new Date(data.history[0].date).toLocaleDateString()}
            </span>
            <span
              className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              {new Date(
                data.history[data.history.length - 1].date
              ).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
