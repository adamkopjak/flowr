"use client";

import type { Article, Sentiment } from "@/lib/news";

function fmtAgo(mins: number): string {
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const h = Math.floor(mins / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

function sourceColors(source: string): { a: string; b: string } {
  const hash = [...source].reduce((a, c) => a + c.charCodeAt(0), 0);
  const h = (hash * 37) % 360;
  return {
    a: `oklch(0.55 0.16 ${h})`,
    b: `oklch(0.32 0.10 ${(h + 60) % 360})`,
  };
}

export function SentimentChip({
  verdict,
  confidence,
  compact = false,
}: {
  verdict: Sentiment["verdict"] | null | undefined;
  confidence?: number | null;
  compact?: boolean;
}) {
  if (!verdict) return null;
  const map = {
    bullish: {
      color: "var(--pos)",
      bg: "var(--accent-soft)",
      label: "Bullish",
      icon: "M2 7 L5 3 L8 7",
      border: "rgba(78,254,154,0.25)",
    },
    bearish: {
      color: "var(--neg)",
      bg: "rgba(255,107,122,0.10)",
      label: "Bearish",
      icon: "M2 3 L5 7 L8 3",
      border: "rgba(255,107,122,0.22)",
    },
    neutral: {
      color: "var(--text-dim)",
      bg: "var(--surface-2)",
      label: "Neutral",
      icon: "M2 5 L8 5",
      border: "var(--border)",
    },
  } as const;
  const m = map[verdict];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: compact ? "3px 8px" : "4px 10px",
        borderRadius: 999,
        fontSize: compact ? 11 : 12,
        fontWeight: 500,
        background: m.bg,
        color: m.color,
        border: "1px solid " + m.border,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10">
        <path
          d={m.icon}
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {m.label}
      {confidence != null && (
        <span
          className="mono"
          style={{ opacity: 0.7, fontSize: compact ? 10 : 11 }}
        >
          · {confidence}%
        </span>
      )}
    </span>
  );
}

export function NewsCard({
  article,
  sentiment,
  status,
  onAnalyze,
  animDelay = 0,
}: {
  article: Article;
  sentiment: Sentiment | undefined;
  status: "idle" | "loading" | "done" | "error" | undefined;
  onAnalyze: (a: Article) => void;
  animDelay?: number;
}) {
  const { a: ca, b: cb } = sourceColors(article.source);
  const isLoading = status === "loading";
  const initial = (article.source[0] || "?").toUpperCase();

  return (
    <article
      className="card news-card fade-up"
      style={{
        animationDelay: animDelay + "ms",
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.25s ease, border-color 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          height: 132,
          background: article.thumbnail
            ? `linear-gradient(135deg, rgba(8,12,10,0.10), rgba(8,12,10,0.55)), url(${article.thumbnail}) center / cover no-repeat`
            : `linear-gradient(135deg, ${ca}, ${cb})`,
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: 14,
        }}
      >
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            background: "rgba(8,12,10,0.45)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
        >
          {article.source}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAnalyze(article);
          }}
          disabled={isLoading}
          aria-label="Ask AI for sentiment"
          className="focus-ring"
          style={{
            background: sentiment ? "rgba(8,12,10,0.45)" : "var(--accent)",
            border:
              "1px solid " +
              (sentiment ? "rgba(255,255,255,0.18)" : "var(--accent)"),
            color: sentiment ? "#fff" : "#04140A",
            padding: "6px 10px 6px 8px",
            borderRadius: 999,
            cursor: isLoading ? "progress" : "pointer",
            fontSize: 11,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "inherit",
            backdropFilter: sentiment ? "blur(8px)" : "none",
            boxShadow: sentiment
              ? "none"
              : "0 6px 18px -6px rgba(0,0,0,0.4)",
            transition: "transform 0.15s ease",
          }}
          onMouseDown={(e) =>
            (e.currentTarget.style.transform = "scale(0.96)")
          }
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: sentiment
                ? "rgba(255,255,255,0.18)"
                : "rgba(4,20,10,0.18)",
            }}
          >
            {isLoading ? (
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                style={{
                  animation: "spin 0.8s linear infinite",
                  transformOrigin: "center",
                }}
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
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path
                  d="M5 1 L5.8 4.2 L9 5 L5.8 5.8 L5 9 L4.2 5.8 L1 5 L4.2 4.2 Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </span>
          {isLoading ? "Analyzing…" : sentiment ? "Re-analyze" : "Ask AI"}
        </button>

        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: -22,
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "rgba(8,12,10,0.55)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.18)",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            boxShadow: "0 10px 24px -8px rgba(0,0,0,0.5)",
          }}
        >
          {initial}
        </div>
      </div>

      <div
        style={{
          padding: "30px 18px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: "var(--text-faint)",
            flexWrap: "wrap",
          }}
        >
          <span className="mono">{fmtAgo(article.minutesAgo)}</span>
          {article.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                padding: "1px 7px",
                borderRadius: 999,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                fontSize: 10,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
          }}
        >
          {article.headline}
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "var(--text-dim)",
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.snippet}
        </p>

        {sentiment && (
          <div
            className="fade-up"
            style={{
              marginTop: "auto",
              padding: "12px 14px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <SentimentChip
                verdict={sentiment.verdict}
                confidence={sentiment.confidence}
              />
              <span
                style={{
                  fontSize: 10,
                  color: "var(--text-faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                AI
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-dim)",
                lineHeight: 1.45,
              }}
            >
              {sentiment.reasoning}
            </div>
          </div>
        )}

        {!sentiment && (
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 6,
              fontSize: 12,
              color: "var(--text-faint)",
            }}
          >
            {article.url ? (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--text-dim)",
                  textDecoration: "underline",
                  textDecorationColor: "var(--border-strong)",
                  textUnderlineOffset: 3,
                }}
              >
                Read full →
              </a>
            ) : (
              <span style={{ color: "var(--text-faint)" }}>—</span>
            )}
            <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
              Tap ✦ Ask AI for take
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
