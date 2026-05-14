"use client";

import { useEffect, useRef } from "react";
import { CoinGlyph } from "@/components/CoinGlyph";
import type { Coin } from "@/lib/coingecko";
import { fmtPct } from "@/lib/format";

export type Holding = { coinId: string; amount: number };

function fmtAmount(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1000)
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1)
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
}

function fmtUSD(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function HoldingsCarousel({
  holdings,
  coins,
  activeIdx,
  setActiveIdx,
}: {
  holdings: Holding[];
  coins: Coin[];
  activeIdx: number;
  setActiveIdx: (updater: number | ((prev: number) => number)) => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const n = holdings.length;
  const at = (offset: number) =>
    holdings[(((activeIdx + offset) % n) + n) % n];

  const center = at(0);
  const prev = at(-1);
  const next = at(1);

  const cCenter = coins.find((c) => c.id === center?.coinId);
  const cPrev = coins.find((c) => c.id === prev?.coinId);
  const cNext = coins.find((c) => c.id === next?.coinId);

  const usd =
    cCenter && center ? cCenter.current_price * center.amount : 0;
  const pos = !!cCenter && (cCenter.price_change_percentage_24h ?? 0) >= 0;

  useEffect(() => {
    if (!stripRef.current) return;
    const el = stripRef.current.querySelector<HTMLElement>(
      `[data-strip-idx="${activeIdx}"]`,
    );
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeIdx]);

  function go(delta: number) {
    setActiveIdx((prev) => (((prev + delta) % n) + n) % n);
  }

  if (!cCenter) {
    return (
      <div className="card carousel-card">
        <div className="skeleton" style={{ height: 140 }} />
        <div className="skeleton" style={{ height: 24, width: "60%" }} />
        <div className="skeleton" style={{ height: 16, width: "40%" }} />
      </div>
    );
  }

  return (
    <div className="card carousel-card fade-up">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontWeight: 600,
          }}
        >
          Holdings
        </div>
        <div
          className="mono"
          style={{ fontSize: 11, color: "var(--text-faint)" }}
        >
          {String(activeIdx + 1).padStart(2, "0")} /{" "}
          {String(n).padStart(2, "0")}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 8,
          minHeight: 156,
        }}
      >
        <button
          onClick={() => go(-1)}
          aria-label="Previous coin"
          className="focus-ring"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            opacity: 0.85,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
        >
          <div style={{ position: "relative" }}>
            {cPrev && <CoinGlyph coin={cPrev} size={44} />}
            <div
              style={{
                position: "absolute",
                right: -4,
                bottom: -4,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                display: "grid",
                placeItems: "center",
                color: "var(--text-dim)",
              }}
            >
              <svg width="9" height="9" viewBox="0 0 10 10">
                <path
                  d="M6.5 2 L3 5 L6.5 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <span
            style={{
              fontSize: 10,
              color: "var(--text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {cPrev?.symbol}
          </span>
        </button>

        <div
          key={center.coinId}
          className="coin-in"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 116,
              height: 116,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              boxShadow: `0 0 0 6px ${
                pos ? "rgba(78,254,154,0.06)" : "rgba(255,107,122,0.06)"
              }, 0 18px 40px -18px rgba(0,0,0,0.5)`,
              position: "relative",
            }}
          >
            <CoinGlyph coin={cCenter} size={92} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {cCenter.name}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 2,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {cCenter.symbol}
              </span>
              <span
                className={pos ? "chip chip-pos" : "chip chip-neg"}
                style={{ padding: "2px 8px", fontSize: 11 }}
              >
                {fmtPct(cCenter.price_change_percentage_24h)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => go(1)}
          aria-label="Next coin"
          className="focus-ring"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            opacity: 0.85,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
        >
          <div style={{ position: "relative" }}>
            {cNext && <CoinGlyph coin={cNext} size={44} />}
            <div
              style={{
                position: "absolute",
                right: -4,
                bottom: -4,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                display: "grid",
                placeItems: "center",
                color: "var(--text-dim)",
              }}
            >
              <svg width="9" height="9" viewBox="0 0 10 10">
                <path
                  d="M3.5 2 L7 5 L3.5 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <span
            style={{
              fontSize: 10,
              color: "var(--text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {cNext?.symbol}
          </span>
        </button>
      </div>

      <div
        key={center.coinId + "-amounts"}
        className="coin-in"
        style={{
          textAlign: "center",
          padding: "4px 0 8px",
          borderTop: "1px dashed var(--border)",
          paddingTop: 18,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--text-faint)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}
        >
          You own
        </div>
        <div
          className="mono"
          style={{
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
          }}
        >
          {fmtAmount(center.amount)}{" "}
          <span
            style={{
              fontSize: 16,
              color: "var(--text-dim)",
              fontWeight: 400,
            }}
          >
            {cCenter.symbol.toUpperCase()}
          </span>
        </div>
        <div
          className="mono"
          style={{
            fontSize: 18,
            color: "var(--text-dim)",
            marginTop: 6,
            letterSpacing: "-0.01em",
          }}
        >
          ≈ {fmtUSD(usd)}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          borderTop: "1px solid var(--border)",
          paddingTop: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            All coins
          </div>
          <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
            scroll →
          </span>
        </div>
        <div
          ref={stripRef}
          className="holdings-strip"
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            overflowY: "hidden",
            padding: "4px 2px 8px",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {holdings.map((h, i) => {
            const c = coins.find((x) => x.id === h.coinId);
            if (!c) return null;
            const active = i === activeIdx;
            return (
              <button
                key={h.coinId}
                data-strip-idx={i}
                onClick={() => setActiveIdx(i)}
                className="focus-ring"
                style={{
                  flex: "0 0 auto",
                  background: active ? "var(--surface-2)" : "transparent",
                  border:
                    "1px solid " +
                    (active ? "var(--border-strong)" : "var(--border)"),
                  borderRadius: 16,
                  padding: "10px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  scrollSnapAlign: "center",
                  minWidth: 0,
                  transition:
                    "background 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.background = "var(--surface-2)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <CoinGlyph coin={c} size={28} />
                <div style={{ textAlign: "left", minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--text)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.symbol.toUpperCase()}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--text-dim)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtUSD(c.current_price * h.amount)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
