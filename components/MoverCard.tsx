"use client";

import { useState } from "react";
import type { Coin } from "@/lib/coingecko";
import { fmtBig, fmtPct, fmtPrice } from "@/lib/format";
import { AnimNum } from "./AnimNum";
import { CoinGlyph } from "./CoinGlyph";
import { Sparkline } from "./Sparkline";

export function MoverCard({
  coin,
  rank,
  onSelect,
}: {
  coin: Coin;
  rank: number;
  onSelect?: (c: Coin) => void;
}) {
  const pos = (coin.price_change_percentage_24h ?? 0) >= 0;
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={() => onSelect?.(coin)}
      className="card fade-up focus-ring"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: 22,
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "var(--bg-card)",
        color: "var(--text)",
        font: "inherit",
        transition: "transform 0.25s ease, border-color 0.25s ease",
        animationDelay: `${rank * 60}ms`,
        border: `1px solid ${hover ? "var(--border-strong)" : "var(--border)"}`,
        transform: hover ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CoinGlyph coin={coin} size={40} />
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {coin.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {coin.symbol}
            </div>
          </div>
        </div>
        <span className={pos ? "chip chip-pos" : "chip chip-neg"}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              d={pos ? "M2 7 L5 3 L8 7" : "M2 3 L5 7 L8 3"}
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {fmtPct(coin.price_change_percentage_24h)}
        </span>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>$</span>
          <span
            className="mono"
            style={{
              fontSize: 30,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            <AnimNum value={coin.current_price} format={fmtPrice} />
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-dim)",
            marginTop: 4,
          }}
        >
          24h vol ·{" "}
          <span className="mono">${fmtBig(coin.total_volume)}</span>
        </div>
      </div>

      <div style={{ marginTop: "auto", marginLeft: -4, marginRight: -4 }}>
        <Sparkline
          data={coin.sparkline_in_7d?.price}
          height={56}
          positive={pos}
        />
      </div>
    </button>
  );
}
