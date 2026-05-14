"use client";

import type { Sentiment } from "@/lib/news";

export function SentimentSummary({
  sentiments,
  total,
  onAnalyzeAll,
  analyzingAll,
}: {
  sentiments: Record<string, Sentiment | undefined>;
  total: number;
  onAnalyzeAll: () => void;
  analyzingAll: boolean;
}) {
  const counts = { bullish: 0, bearish: 0, neutral: 0 };
  Object.values(sentiments).forEach((s) => {
    if (s?.verdict) counts[s.verdict] = (counts[s.verdict] || 0) + 1;
  });
  const analyzed = counts.bullish + counts.bearish + counts.neutral;
  const pct = (n: number) => (analyzed > 0 ? (n / analyzed) * 100 : 0);
  const done = analyzed === total && total > 0;

  return (
    <div
      className="card"
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Market mood
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 26,
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              {analyzed}
              <span style={{ color: "var(--text-faint)" }}>/{total}</span>
            </span>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
              stories analyzed
            </span>
          </div>
        </div>

        <button
          onClick={onAnalyzeAll}
          disabled={analyzingAll || done}
          className="focus-ring"
          style={{
            background: analyzingAll ? "var(--surface-2)" : "var(--accent)",
            color: analyzingAll ? "var(--text-dim)" : "#04140A",
            border:
              "1px solid " +
              (analyzingAll ? "var(--border)" : "var(--accent)"),
            padding: "9px 16px 9px 12px",
            borderRadius: 999,
            cursor: analyzingAll || done ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            opacity: done && !analyzingAll ? 0.5 : 1,
          }}
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: analyzingAll
                ? "var(--border)"
                : "rgba(4,20,10,0.18)",
              display: "grid",
              placeItems: "center",
            }}
          >
            {analyzingAll ? (
              <svg
                width="11"
                height="11"
                viewBox="0 0 10 10"
                style={{ animation: "spin 0.8s linear infinite" }}
              >
                <circle
                  cx="5"
                  cy="5"
                  r="3.2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="14"
                  strokeDashoffset="6"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 10 10">
                <path
                  d="M5 1 L5.8 4.2 L9 5 L5.8 5.8 L5 9 L4.2 5.8 L1 5 L4.2 4.2 Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </span>
          {analyzingAll
            ? "Analyzing all…"
            : done
              ? "All analyzed"
              : "Analyze all"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          height: 10,
          borderRadius: 999,
          overflow: "hidden",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
        }}
      >
        {counts.bullish > 0 && (
          <div
            style={{
              width: pct(counts.bullish) + "%",
              background: "var(--pos)",
            }}
          />
        )}
        {counts.neutral > 0 && (
          <div
            style={{
              width: pct(counts.neutral) + "%",
              background: "var(--text-faint)",
            }}
          />
        )}
        {counts.bearish > 0 && (
          <div
            style={{
              width: pct(counts.bearish) + "%",
              background: "var(--neg)",
            }}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          fontSize: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--pos)",
            }}
          />
          <span style={{ color: "var(--text-dim)" }}>Bullish</span>
          <span className="mono" style={{ color: "var(--text)" }}>
            {counts.bullish}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--text-faint)",
            }}
          />
          <span style={{ color: "var(--text-dim)" }}>Neutral</span>
          <span className="mono" style={{ color: "var(--text)" }}>
            {counts.neutral}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--neg)",
            }}
          />
          <span style={{ color: "var(--text-dim)" }}>Bearish</span>
          <span className="mono" style={{ color: "var(--text)" }}>
            {counts.bearish}
          </span>
        </div>
      </div>
    </div>
  );
}
