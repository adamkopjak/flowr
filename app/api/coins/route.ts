import { NextResponse } from "next/server";
import { FALLBACK_COINS, type Coin } from "@/lib/coingecko";

export const revalidate = 60;

export async function GET() {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=true&price_change_percentage=24h";

  try {
    const r = await fetch(url, {
      headers: {
        accept: "application/json",
        ...(process.env.COINGECKO_API_KEY
          ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }
          : {}),
      },
      next: { revalidate: 60 },
    });
    if (!r.ok) throw new Error("http " + r.status);
    const data = (await r.json()) as Coin[];
    if (!Array.isArray(data) || data.length === 0) throw new Error("empty");
    return NextResponse.json({ coins: data, source: "live" });
  } catch (e) {
    console.warn(
      "[flowr/api/coins] CoinGecko unavailable, using fallback:",
      (e as Error).message,
    );
    return NextResponse.json({ coins: FALLBACK_COINS, source: "fallback" });
  }
}
