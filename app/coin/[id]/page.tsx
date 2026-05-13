"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AIChatPanel, AIOrb } from "@/components/AIChat";
import { CoinGlyph } from "@/components/CoinGlyph";
import { CompareChart, type RangeKey } from "@/components/CompareChart";
import { CompareChip } from "@/components/CompareChip";
import { ComparePicker } from "@/components/ComparePicker";
import { DataStat } from "@/components/DataStat";
import { FlowrLogo } from "@/components/FlowrLogo";
import { SidebarCoin } from "@/components/SidebarCoin";
import { fetchCoins, type Coin } from "@/lib/coingecko";
import { fmtBig, fmtPct, fmtPrice } from "@/lib/format";
import { readInitialTheme, type Theme } from "@/lib/theme";

const COMPARE_COLORS = [
  "#5B9BFF",
  "#C77DFF",
  "#FFB066",
  "#FF6B7A",
  "#F2D24E",
  "#7BE5C9",
];

export default function CoinPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const coinId = params?.id || "bitcoin";

  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [range, setRange] = useState<RangeKey>("7d");
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarQ, setSidebarQ] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("flowr-theme", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    fetchCoins().then(({ coins }) => {
      if (cancelled) return;
      setCoins(coins);
      setLoading(false);
    });
    const id = setInterval(() => {
      fetchCoins().then(({ coins }) => {
        if (!cancelled) setCoins(coins);
      });
    }, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  function selectCoin(coin: Coin) {
    setCompareIds((prev) => prev.filter((id) => id !== coin.id));
    router.push(`/coin/${coin.id}`);
  }

  const coin = useMemo(
    () => coins.find((c) => c.id === coinId),
    [coins, coinId],
  );
  const compareCoins = useMemo(
    () =>
      compareIds
        .map((id) => coins.find((c) => c.id === id))
        .filter((c): c is Coin => Boolean(c)),
    [coins, compareIds],
  );

  const series = useMemo(() => {
    if (!coin) return [];
    const out = [
      {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        color: "var(--accent)",
        prices: coin.sparkline_in_7d?.price || [],
      },
    ];
    compareCoins.forEach((c, i) => {
      out.push({
        id: c.id,
        name: c.name,
        symbol: c.symbol.toUpperCase(),
        color: COMPARE_COLORS[i % COMPARE_COLORS.length],
        prices: c.sparkline_in_7d?.price || [],
      });
    });
    return out;
  }, [coin, compareCoins]);

  const pos = !!coin && (coin.price_change_percentage_24h ?? 0) >= 0;

  const data = useMemo(() => {
    if (!coin) return null;
    const points = coin.sparkline_in_7d?.price || [];
    const low7 = points.length ? Math.min(...points) : 0;
    const high7 = points.length ? Math.max(...points) : 0;
    const circulating =
      coin.current_price > 0 ? (coin.market_cap || 0) / coin.current_price : 0;
    return {
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      low7,
      high7,
      ath: high7 * 1.18,
      atl: low7 * 0.65,
      circulating,
      rank: coins.findIndex((c) => c.id === coin.id) + 1,
    };
  }, [coin, coins]);

  const sidebarList = useMemo(() => {
    return coins.filter((c) => {
      if (!sidebarQ.trim()) return true;
      const n = sidebarQ.toLowerCase();
      return (
        c.name.toLowerCase().includes(n) || c.symbol.toLowerCase().includes(n)
      );
    });
  }, [coins, sidebarQ]);

  return (
    <div className="coin-page">
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
            <FlowrLogo size={28} />
          </Link>
          <span className="breadcrumb-trail">
            <span style={{ color: "var(--text-faint)", fontSize: 13 }}>/</span>
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
              Markets
            </span>
            {coin && (
              <>
                <span style={{ color: "var(--text-faint)", fontSize: 13 }}>
                  /
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--text)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {coin.name}
                </span>
              </>
            )}
          </span>
        </div>

        <div
          className="coin-header-actions"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <Link
            href="/"
            className="coin-back-link"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "8px 14px",
              borderRadius: 999,
              fontSize: 12,
              color: "var(--text-dim)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path
                d="M6 2 L2 5 L6 8"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="dashboard-link-text">Dashboard</span>
          </Link>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              width: 38,
              height: 38,
              borderRadius: "50%",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              color: "var(--text)",
              flexShrink: 0,
            }}
          >
            {theme === "dark" ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
                  const rad = (a * Math.PI) / 180;
                  return (
                    <line
                      key={a}
                      x1={8 + Math.cos(rad) * 5.5}
                      y1={8 + Math.sin(rad) * 5.5}
                      x2={8 + Math.cos(rad) * 7}
                      y2={8 + Math.sin(rad) * 7}
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12.5 9.5 A 5 5 0 1 1 6.5 3.5 A 4 4 0 0 0 12.5 9.5 Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
          <button
            className="sign-in-btn"
            style={{
              background: "var(--text)",
              color: "var(--bg)",
              border: "none",
              padding: "9px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign in
          </button>
        </div>
      </header>

      <div className="coin-grid">
        <aside
          className="card coin-sidebar"
          style={{
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            position: "sticky",
            top: 16,
          }}
        >
          <div style={{ padding: "8px 10px 0" }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-faint)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Other markets
            </div>
            <input
              value={sidebarQ}
              onChange={(e) => setSidebarQ(e.target.value)}
              placeholder="Search…"
              style={{
                width: "100%",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 12,
                outline: "none",
                color: "var(--text)",
                fontFamily: "inherit",
              }}
            />
          </div>
          <div
            className="sidebar-coins"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxHeight: "calc(100vh - 200px)",
              overflowY: "auto",
              paddingRight: 2,
            }}
          >
            {loading
              ? [0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} style={{ padding: "10px 12px" }}>
                    <div className="skeleton" style={{ height: 28 }} />
                  </div>
                ))
              : sidebarList.map((c) => (
                  <SidebarCoin
                    key={c.id}
                    coin={c}
                    active={c.id === coinId}
                    onSelect={selectCoin}
                  />
                ))}
          </div>
        </aside>

        <main className="coin-main">
          <section
            className="card chart-card"
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div
              className="chart-card-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  minWidth: 0,
                }}
              >
                {coin ? (
                  <CoinGlyph coin={coin} size={48} />
                ) : (
                  <div
                    className="skeleton"
                    style={{ width: 48, height: 48, borderRadius: "50%" }}
                  />
                )}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <h1
                      className="hero-title"
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {coin?.name || "—"}
                    </h1>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-dim)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {coin?.symbol}
                    </span>
                    {data && data.rank > 0 && (
                      <span className="chip" style={{ padding: "2px 8px" }}>
                        #{data.rank}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 10,
                      marginTop: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className="mono hero-price"
                      style={{
                        fontWeight: 500,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ${coin ? fmtPrice(coin.current_price) : "—"}
                    </span>
                    {coin && (
                      <span className={pos ? "chip chip-pos" : "chip chip-neg"}>
                        {fmtPct(coin.price_change_percentage_24h)} · 24h
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <ComparePicker
                  coins={coins}
                  activeIds={[coinId, ...compareIds]}
                  onAdd={(c) =>
                    setCompareIds((prev) => [...prev, c.id])
                  }
                />
                <div
                  style={{
                    display: "flex",
                    gap: 2,
                    padding: 3,
                    background: "var(--surface-2)",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                  }}
                >
                  {(
                    [
                      { k: "24h", label: "24H" },
                      { k: "3d", label: "3D" },
                      { k: "7d", label: "7D" },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.k}
                      onClick={() => setRange(r.k)}
                      style={{
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: 999,
                        background:
                          range === r.k ? "var(--text)" : "transparent",
                        color:
                          range === r.k ? "var(--bg)" : "var(--text-dim)",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {series.length > 1 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {series.map((s, i) => (
                  <CompareChip
                    key={s.id}
                    series={s}
                    isPrimary={i === 0}
                    onRemove={() =>
                      setCompareIds((prev) =>
                        prev.filter((id) => id !== s.id),
                      )
                    }
                  />
                ))}
              </div>
            )}

            <div className="chart-h" style={{ width: "100%" }}>
              {coin ? (
                <CompareChart series={series} range={range} showGrid />
              ) : (
                <div
                  className="skeleton"
                  style={{ height: "100%", borderRadius: 18 }}
                />
              )}
            </div>

            {series.length > 1 && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-faint)",
                  textAlign: "center",
                }}
              >
                Values shown as % change from the start of the selected range,
                so coins of any size can be compared.
              </div>
            )}
          </section>

          <section
            className="card"
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--accent)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Market data
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Key metrics for {coin?.name || "—"}
                </h2>
              </div>
            </div>
            <div className="data-grid">
              {data && coin ? (
                <>
                  <DataStat
                    label="Market cap"
                    value={"$" + fmtBig(data.marketCap)}
                    sub={`Rank #${data.rank}`}
                  />
                  <DataStat
                    label="24h volume"
                    value={"$" + fmtBig(data.volume)}
                    sub="trading activity"
                  />
                  <DataStat
                    label="Circulating"
                    value={fmtBig(data.circulating)}
                    sub={coin.symbol.toUpperCase() + " in supply"}
                  />
                  <DataStat
                    label="24h change"
                    value={fmtPct(coin.price_change_percentage_24h)}
                    color={pos ? "var(--pos)" : "var(--neg)"}
                  />
                  <DataStat
                    label="7d low"
                    value={"$" + fmtPrice(data.low7)}
                  />
                  <DataStat
                    label="7d high"
                    value={"$" + fmtPrice(data.high7)}
                  />
                  <DataStat
                    label="All-time high"
                    value={"$" + fmtPrice(data.ath)}
                    sub="≈ estimate"
                  />
                  <DataStat
                    label="All-time low"
                    value={"$" + fmtPrice(data.atl)}
                    sub="≈ estimate"
                  />
                </>
              ) : (
                [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{ height: 76, borderRadius: 18 }}
                  />
                ))
              )}
            </div>
          </section>

          <footer
            style={{
              fontSize: 11,
              color: "var(--text-faint)",
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <span>flowr. · prices from CoinGecko · refresh every 60s</span>
            <span>
              Ask the AI for history, fundamentals, or comparison context ↘
            </span>
          </footer>
        </main>
      </div>

      <AIOrb open={chatOpen} setOpen={setChatOpen} pulse />
      <AIChatPanel
        open={chatOpen}
        setOpen={setChatOpen}
        coins={[coin, ...compareCoins].filter((c): c is Coin => Boolean(c))}
      />
    </div>
  );
}
