"use client";

import type { Coin } from "@/lib/coingecko";
import { fmtPct, fmtPrice } from "@/lib/format";

export function MarketTicker({ coins }: { coins: Coin[] }) {
  const items = [...coins, ...coins];
  return (
    <div
      style={{
        overflow: "hidden",
        borderRadius: 999,
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "10px 0",
      }}
    >
      <div
        className="ticker-track"
        style={{
          display: "flex",
          gap: 32,
          whiteSpace: "nowrap",
          width: "max-content",
        }}
      >
        {items.map((c, i) => {
          const pos = (c.price_change_percentage_24h ?? 0) >= 0;
          return (
            <div
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
              }}
            >
              <span
                style={{
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  letterSpacing: "0.08em",
                  fontSize: 11,
                }}
              >
                {c.symbol}
              </span>
              <span className="mono">${fmtPrice(c.current_price)}</span>
              <span
                style={{
                  color: pos ? "var(--pos)" : "var(--neg)",
                  fontSize: 12,
                }}
                className="mono"
              >
                {fmtPct(c.price_change_percentage_24h)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
