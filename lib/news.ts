export type Article = {
  id: string;
  source: string;
  url: string | null;
  minutesAgo: number;
  publishedAt: string | null;
  headline: string;
  snippet: string;
  tags: string[];
  thumbnail: string | null;
};

export type NewsFetchResult = {
  articles: Article[];
  source: "live" | "fallback";
};

export type Sentiment = {
  verdict: "bullish" | "bearish" | "neutral";
  confidence: number;
  reasoning: string;
};

export const FALLBACK_ARTICLES: Article[] = [
  {
    id: "n01",
    source: "CoinDesk",
    url: null,
    minutesAgo: 14,
    publishedAt: null,
    headline: "Bitcoin reclaims $71k as spot ETF inflows hit a four-week high",
    snippet:
      "Net inflows into U.S. spot bitcoin ETFs topped $440M on Tuesday, the biggest single-day haul since mid-April, lifting BTC above the $71,000 level for the first time in nine days.",
    tags: ["BTC", "ETF", "Macro"],
    thumbnail: null,
  },
  {
    id: "n02",
    source: "The Block",
    url: null,
    minutesAgo: 38,
    publishedAt: null,
    headline:
      "Solana validator earnings hit record high as memecoin volume rebounds",
    snippet:
      "On-chain priority fees pushed validator revenue above $11M for the week, with memecoin trading on Pump.fun and Raydium accounting for the bulk of network activity.",
    tags: ["SOL", "DeFi"],
    thumbnail: null,
  },
  {
    id: "n03",
    source: "Bloomberg",
    url: null,
    minutesAgo: 52,
    publishedAt: null,
    headline: "SEC delays decision on second wave of Ether ETF filings to July",
    snippet:
      "The regulator pushed back its review window for three Ether-related filings, citing additional staff comments. Issuers say the delay is procedural and not a sign of rejection.",
    tags: ["ETH", "ETF", "Regulation"],
    thumbnail: null,
  },
  {
    id: "n04",
    source: "Decrypt",
    url: null,
    minutesAgo: 68,
    publishedAt: null,
    headline:
      "Major exchange halts XRP withdrawals after detecting suspicious outflows",
    snippet:
      "Withdrawals were paused for roughly four hours after the exchange spotted abnormal wallet activity. The platform says customer funds are unaffected and an investigation is ongoing.",
    tags: ["XRP", "Security"],
    thumbnail: null,
  },
  {
    id: "n05",
    source: "CryptoSlate",
    url: null,
    minutesAgo: 92,
    publishedAt: null,
    headline:
      "Chainlink launches cross-chain payments network for institutional pilots",
    snippet:
      "Eight global banks have signed on for a private testnet that uses CCIP to settle tokenized assets between siloed bank ledgers, with public rollout targeted for Q4.",
    tags: ["LINK", "Enterprise", "DeFi"],
    thumbnail: null,
  },
  {
    id: "n06",
    source: "Reuters",
    url: null,
    minutesAgo: 110,
    publishedAt: null,
    headline: "U.S. CPI cools to 3.2% in April, easing pressure on the Fed",
    snippet:
      "Headline inflation came in below the 3.4% consensus, sending Treasury yields lower and risk assets — including crypto — broadly higher in early trading.",
    tags: ["Macro", "BTC"],
    thumbnail: null,
  },
  {
    id: "n07",
    source: "Cointelegraph",
    url: null,
    minutesAgo: 135,
    publishedAt: null,
    headline: "Mt. Gox trustee begins repaying creditors with $9B in BTC and BCH",
    snippet:
      "Repayments started in waves to verified creditors via designated exchanges. Analysts are watching wallets for signs of immediate selling pressure on the open market.",
    tags: ["BTC", "Macro"],
    thumbnail: null,
  },
  {
    id: "n08",
    source: "Axios",
    url: null,
    minutesAgo: 168,
    publishedAt: null,
    headline: "Polygon Labs cuts 19% of workforce as treasury runway tightens",
    snippet:
      "CEO Marc Boiron told staff the restructure focuses headcount on the AggLayer roadmap. Affected employees receive 12 weeks of severance and accelerated vesting.",
    tags: ["MATIC", "Layoffs"],
    thumbnail: null,
  },
  {
    id: "n09",
    source: "Financial Times",
    url: null,
    minutesAgo: 210,
    publishedAt: null,
    headline:
      "BlackRock files to add bitcoin exposure to two flagship income funds",
    snippet:
      "A pair of S-1 amendments would let BlackRock's Strategic Income Opportunities and Strategic Global Bond funds hold up to 2% in spot bitcoin via its IBIT ETF.",
    tags: ["BTC", "ETF", "Institutional"],
    thumbnail: null,
  },
  {
    id: "n10",
    source: "CoinDesk",
    url: null,
    minutesAgo: 245,
    publishedAt: null,
    headline: "Avalanche subnets gain traction with three new gaming launches",
    snippet:
      "Off the back of the Etna upgrade, three studios announced subnet deployments this week. Total AVAX staked in subnet validators rose 8% week-on-week.",
    tags: ["AVAX", "Gaming"],
    thumbnail: null,
  },
  {
    id: "n11",
    source: "The Block",
    url: null,
    minutesAgo: 290,
    publishedAt: null,
    headline: "Tether mints $1B USDT on Tron amid surging Asian stablecoin demand",
    snippet:
      'The fresh issuance brings Tron-based USDT supply to a new all-time high, with Tether CEO Paolo Ardoino calling it an "authorized but not issued" inventory replenishment.',
    tags: ["USDT", "TRX", "Stablecoins"],
    thumbnail: null,
  },
  {
    id: "n12",
    source: "Bloomberg",
    url: null,
    minutesAgo: 360,
    publishedAt: null,
    headline:
      "Hong Kong regulator approves first tokenized money-market fund for retail",
    snippet:
      "The SFC greenlit a yield-bearing on-chain fund backed by HKD treasuries, opening on-chain finance to retail investors for the first time in the region.",
    tags: ["Regulation", "Asia", "RWA"],
    thumbnail: null,
  },
];

export async function fetchNews(): Promise<NewsFetchResult> {
  try {
    const r = await fetch("/api/news", { cache: "no-store" });
    if (!r.ok) throw new Error("http " + r.status);
    const data = (await r.json()) as NewsFetchResult;
    if (!Array.isArray(data.articles) || data.articles.length === 0)
      throw new Error("empty");
    return data;
  } catch (e) {
    console.warn(
      "[flowr] /api/news unavailable, using fallback data:",
      (e as Error).message,
    );
    return { articles: FALLBACK_ARTICLES, source: "fallback" };
  }
}

export async function analyzeArticle(article: {
  headline: string;
  snippet: string;
  tags: string[];
}): Promise<Sentiment> {
  try {
    const r = await fetch("/api/news/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(article),
    });
    const data = (await r.json()) as Sentiment & { error?: string };
    return {
      verdict: data.verdict || "neutral",
      confidence: Math.max(0, Math.min(100, Number(data.confidence) || 0)),
      reasoning: data.reasoning || "AI unavailable — try again in a moment.",
    };
  } catch (e) {
    console.warn("[flowr] analyze failed:", (e as Error).message);
    return {
      verdict: "neutral",
      confidence: 0,
      reasoning: "AI unavailable — try again in a moment.",
    };
  }
}
