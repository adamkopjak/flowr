"use client";

import type { Coin } from "@/lib/coingecko";
import { fmtBig, fmtPct, fmtPrice } from "@/lib/format";
import { CoinGlyph } from "./CoinGlyph";
import { Sparkline } from "./Sparkline";

export function PriceRow({
  coin,
  idx,
  isWatched,
  onWatch,
  onSelect,
}: {
  coin: Coin;
  idx: number;
  isWatched: boolean;
  onWatch: (id: string) => void;
  onSelect?: (c: Coin) => void;
}) {
  const pos = (coin.price_change_percentage_24h ?? 0) >= 0;
  return (
    <div
      className="row price-grid"
      onClick={() => onSelect?.(coin)}
      style={{ borderRadius: 18, cursor: "pointer" }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onWatch(coin.id);
        }}
        className="col-watch"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: isWatched ? "var(--accent)" : "var(--text-faint)",
          fontSize: 16,
          padding: 0,
          lineHeight: 1,
        }}
        aria-label="toggle watchlist"
      >
        {isWatched ? "★" : "☆"}
      </button>
      <div
        className="mono col-rank"
        style={{ color: "var(--text-faint)", fontSize: 12 }}
      >
        {String(idx + 1).padStart(2, "0")}
      </div>
      <div
        className="col-asset"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 0,
        }}
      >
        <CoinGlyph coin={coin} size={32} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
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
            {coin.symbol}
          </div>
        </div>
      </div>
      <div
        className="mono col-price"
        style={{ fontSize: 14, fontWeight: 500, textAlign: "right" }}
      >
        ${fmtPrice(coin.current_price)}
      </div>
      <div className="col-change" style={{ textAlign: "right" }}>
        <span className={pos ? "chip chip-pos" : "chip chip-neg"}>
          {fmtPct(coin.price_change_percentage_24h)}
        </span>
      </div>
      <div
        className="mono col-mcap"
        style={{
          fontSize: 13,
          color: "var(--text-dim)",
          textAlign: "right",
        }}
      >
        ${fmtBig(coin.market_cap)}
      </div>
      <div className="col-spark" style={{ textAlign: "right" }}>
        <Sparkline
          data={coin.sparkline_in_7d?.price}
          height={28}
          positive={pos}
          fill={false}
        />
      </div>
      <div className="col-trade" style={{ textAlign: "right" }}>
        <button
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Trade
        </button>
      </div>
    </div>
  );
}

export function PriceRowHeader() {
  return (
    <div
      className="price-grid price-grid-head"
      style={{
        fontSize: 11,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span className="col-watch" />
      <span className="col-rank">#</span>
      <span className="col-asset">Asset</span>
      <span className="col-price" style={{ textAlign: "right" }}>
        Price
      </span>
      <span className="col-change" style={{ textAlign: "right" }}>
        24h
      </span>
      <span className="col-mcap" style={{ textAlign: "right" }}>
        Market cap
      </span>
      <span className="col-spark" style={{ textAlign: "right" }}>
        7d chart
      </span>
      <span className="col-trade" />
    </div>
  );
}
