export type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d: { price: number[] };
};

export type FetchResult = {
  coins: Coin[];
  source: "live" | "fallback";
};

function genSpark(lo: number, hi: number): number[] {
  const out: number[] = [];
  let v = (lo + hi) / 2;
  for (let i = 0; i < 168; i++) {
    v += (Math.random() - 0.5) * (hi - lo) * 0.08;
    v = Math.max(lo * 0.92, Math.min(hi * 1.05, v));
    out.push(v);
  }
  return out;
}

export const FALLBACK_COINS: Coin[] = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", image: null, current_price: 71240.5, price_change_percentage_24h: 2.41, market_cap: 1_410_000_000_000, total_volume: 38_200_000_000, sparkline_in_7d: { price: genSpark(68000, 72000) } },
  { id: "ethereum", symbol: "eth", name: "Ethereum", image: null, current_price: 3845.22, price_change_percentage_24h: 3.82, market_cap: 462_000_000_000, total_volume: 18_900_000_000, sparkline_in_7d: { price: genSpark(3500, 3900) } },
  { id: "solana", symbol: "sol", name: "Solana", image: null, current_price: 184.06, price_change_percentage_24h: 8.14, market_cap: 87_000_000_000, total_volume: 4_100_000_000, sparkline_in_7d: { price: genSpark(160, 190) } },
  { id: "binancecoin", symbol: "bnb", name: "BNB", image: null, current_price: 612.45, price_change_percentage_24h: -1.22, market_cap: 91_000_000_000, total_volume: 1_800_000_000, sparkline_in_7d: { price: genSpark(600, 640) } },
  { id: "ripple", symbol: "xrp", name: "XRP", image: null, current_price: 0.625, price_change_percentage_24h: -2.92, market_cap: 34_500_000_000, total_volume: 2_100_000_000, sparkline_in_7d: { price: genSpark(0.6, 0.66) } },
  { id: "dogecoin", symbol: "doge", name: "Dogecoin", image: null, current_price: 0.158, price_change_percentage_24h: 5.61, market_cap: 22_800_000_000, total_volume: 1_300_000_000, sparkline_in_7d: { price: genSpark(0.14, 0.17) } },
  { id: "cardano", symbol: "ada", name: "Cardano", image: null, current_price: 0.472, price_change_percentage_24h: -0.42, market_cap: 16_800_000_000, total_volume: 480_000_000, sparkline_in_7d: { price: genSpark(0.45, 0.49) } },
  { id: "avalanche-2", symbol: "avax", name: "Avalanche", image: null, current_price: 38.2, price_change_percentage_24h: 4.1, market_cap: 14_600_000_000, total_volume: 540_000_000, sparkline_in_7d: { price: genSpark(34, 40) } },
  { id: "tron", symbol: "trx", name: "TRON", image: null, current_price: 0.118, price_change_percentage_24h: 0.78, market_cap: 10_500_000_000, total_volume: 410_000_000, sparkline_in_7d: { price: genSpark(0.115, 0.122) } },
  { id: "chainlink", symbol: "link", name: "Chainlink", image: null, current_price: 17.65, price_change_percentage_24h: 6.92, market_cap: 10_300_000_000, total_volume: 620_000_000, sparkline_in_7d: { price: genSpark(15, 18) } },
  { id: "polkadot", symbol: "dot", name: "Polkadot", image: null, current_price: 7.42, price_change_percentage_24h: -3.31, market_cap: 9_800_000_000, total_volume: 280_000_000, sparkline_in_7d: { price: genSpark(7.0, 7.8) } },
  { id: "matic-network", symbol: "matic", name: "Polygon", image: null, current_price: 0.748, price_change_percentage_24h: -4.85, market_cap: 7_400_000_000, total_volume: 410_000_000, sparkline_in_7d: { price: genSpark(0.72, 0.82) } },
  { id: "litecoin", symbol: "ltc", name: "Litecoin", image: null, current_price: 85.3, price_change_percentage_24h: 1.1, market_cap: 6_400_000_000, total_volume: 320_000_000, sparkline_in_7d: { price: genSpark(82, 88) } },
  { id: "uniswap", symbol: "uni", name: "Uniswap", image: null, current_price: 9.85, price_change_percentage_24h: 7.42, market_cap: 5_900_000_000, total_volume: 180_000_000, sparkline_in_7d: { price: genSpark(8.8, 10.1) } },
  { id: "aptos", symbol: "apt", name: "Aptos", image: null, current_price: 12.4, price_change_percentage_24h: -5.68, market_cap: 5_600_000_000, total_volume: 220_000_000, sparkline_in_7d: { price: genSpark(12, 13.5) } },
];

export async function fetchCoins(): Promise<FetchResult> {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=true&price_change_percentage=24h";
  try {
    const r = await fetch(url, { headers: { accept: "application/json" } });
    if (!r.ok) throw new Error("http " + r.status);
    const data = (await r.json()) as Coin[];
    if (!Array.isArray(data) || data.length === 0) throw new Error("empty");
    return { coins: data, source: "live" };
  } catch (e) {
    console.warn(
      "[flowr] CoinGecko unavailable, using fallback data:",
      (e as Error).message,
    );
    return { coins: FALLBACK_COINS, source: "fallback" };
  }
}
