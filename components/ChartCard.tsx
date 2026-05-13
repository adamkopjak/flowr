"use client";

import type { Coin } from "@/lib/coingecko";
import { fmtPct, fmtPrice } from "@/lib/format";
import { CoinGlyph } from "./CoinGlyph";
import { PriceChart } from "./PriceChart";

export function ChartCard({ coin }: { coin: Coin }) {
  const pos = (coin.price_change_percentage_24h ?? 0) >= 0;
  const points = coin.sparkline_in_7d?.price || [];
  const low = points.length ? Math.min(...points) : 0;
  const high = points.length ? Math.max(...points) : 0;

  return (
    <div
      className="card fade-up"
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
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CoinGlyph coin={coin} size={28} />
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {coin.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {coin.symbol} / USD
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {(["24h", "7d", "30d"] as const).map((r) => (
            <span
              key={r}
              style={{
                padding: "4px 8px",
                fontSize: 11,
                borderRadius: 999,
                background: r === "7d" ? "var(--surface-2)" : "transparent",
                color: r === "7d" ? "var(--text)" : "var(--text-faint)",
                border:
                  "1px solid " + (r === "7d" ? "var(--border)" : "transparent"),
              }}
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          ${fmtPrice(coin.current_price)}
        </div>
        <span className={pos ? "chip chip-pos" : "chip chip-neg"}>
          {fmtPct(coin.price_change_percentage_24h)}
        </span>
      </div>

      <div style={{ margin: "0 -8px" }}>
        <PriceChart data={points} height={86} positive={pos} />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--text-faint)",
        }}
      >
        <span>
          low{" "}
          <span className="mono" style={{ color: "var(--text-dim)" }}>
            ${fmtPrice(low)}
          </span>
        </span>
        <span>
          high{" "}
          <span className="mono" style={{ color: "var(--text-dim)" }}>
            ${fmtPrice(high)}
          </span>
        </span>
      </div>
    </div>
  );
}
