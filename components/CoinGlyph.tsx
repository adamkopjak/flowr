"use client";

import { useState } from "react";
import type { Coin } from "@/lib/coingecko";

export function CoinGlyph({
  coin,
  size = 36,
}: {
  coin: Pick<Coin, "symbol" | "image">;
  size?: number;
}) {
  const sym = (coin?.symbol || "?").toUpperCase().slice(0, 3);
  const hash = [...sym].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = (hash * 47) % 360;
  const [errored, setErrored] = useState(false);

  if (coin?.image && !errored) {
    return (
      <img
        src={coin.image}
        alt={sym}
        width={size}
        height={size}
        style={{
          borderRadius: size * 0.5,
          background: "var(--surface-2)",
        }}
        onError={() => setErrored(true)}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.5,
        background: `linear-gradient(135deg, oklch(0.72 0.15 ${hue}), oklch(0.45 0.12 ${(hue + 40) % 360}))`,
        display: "grid",
        placeItems: "center",
        color: "#fff",
        fontWeight: 600,
        fontSize: size * 0.32,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        boxShadow: "0 1px 0 rgba(255,255,255,0.18) inset",
      }}
    >
      {sym.slice(0, 3)}
    </div>
  );
}
