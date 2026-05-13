"use client";

import type { ChartSeries } from "./CompareChart";

export function CompareChip({
  series,
  isPrimary,
  onRemove,
}: {
  series: ChartSeries;
  isPrimary: boolean;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px 6px 8px",
        borderRadius: 999,
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        fontSize: 12,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: series.color,
          boxShadow: isPrimary ? `0 0 8px ${series.color}88` : "none",
        }}
      />
      <span style={{ fontWeight: 500, color: "var(--text)" }}>
        {series.name}
      </span>
      <span
        style={{
          color: "var(--text-dim)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontSize: 10,
        }}
      >
        {series.symbol}
      </span>
      {!isPrimary && (
        <button
          onClick={onRemove}
          aria-label="Remove"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-faint)",
            padding: 2,
            marginLeft: 2,
            lineHeight: 0,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M2 2 L8 8 M8 2 L2 8"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
