"use client";

import type { Coin } from "@/lib/coingecko";
import { fmtPct, fmtPrice } from "@/lib/format";
import { CoinGlyph } from "./CoinGlyph";

export function SidebarCoin({
  coin,
  active,
  onSelect,
}: {
  coin: Coin;
  active: boolean;
  onSelect: (c: Coin) => void;
}) {
  const pos = (coin.price_change_percentage_24h ?? 0) >= 0;
  return (
    <button
      onClick={() => onSelect(coin)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 14,
        border:
          "1px solid " +
          (active ? "var(--border-strong)" : "transparent"),
        background: active ? "var(--surface-2)" : "transparent",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s ease, border-color 0.15s ease",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--surface-2)";
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
      }}
    >
      <CoinGlyph coin={coin} size={28} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {coin.name}
        </div>
        <div
          className="mono"
          style={{ fontSize: 11, color: "var(--text-dim)" }}
        >
          ${fmtPrice(coin.current_price)}
        </div>
      </div>
      <span
        className="mono"
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: pos ? "var(--pos)" : "var(--neg)",
        }}
      >
        {fmtPct(coin.price_change_percentage_24h)}
      </span>
    </button>
  );
}
