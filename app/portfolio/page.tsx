"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AIChatPanel, AIOrb } from "@/components/AIChat";
import { CoinGlyph } from "@/components/CoinGlyph";
import { FlowrLogo } from "@/components/FlowrLogo";
import {
  HoldingsCarousel,
  type Holding,
} from "@/components/HoldingsCarousel";
import { MobileMenu, MobileMenuButton } from "@/components/MobileMenu";
import { ConnectWalletButton } from "@/components/Wallet";
import {
  PortfolioChart,
  type PortfolioRangeKey,
} from "@/components/PortfolioChart";
import { fetchCoins, type Coin } from "@/lib/coingecko";
import { readInitialTheme, type Theme } from "@/lib/theme";

const HOLDINGS: Holding[] = [
  { coinId: "bitcoin", amount: 0.4521 },
  { coinId: "ethereum", amount: 4.2 },
  { coinId: "solana", amount: 32.5 },
  { coinId: "chainlink", amount: 85.0 },
  { coinId: "dogecoin", amount: 12000 },
  { coinId: "avalanche-2", amount: 22.0 },
];

const LEGEND_COLORS = [
  "var(--accent)",
  "#5B9BFF",
  "#C77DFF",
  "#FFB066",
  "#F2D24E",
  "#7BE5C9",
];

const RANGES: { k: PortfolioRangeKey; label: string }[] = [
  { k: "24h", label: "24H" },
  { k: "3d", label: "3D" },
  { k: "7d", label: "7D" },
  { k: "30d", label: "30D" },
  { k: "1y", label: "1Y" },
  { k: "all", label: "ALL" },
];

function fmtAmount(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1000)
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1)
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
}

function fmtUSD(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default function PortfolioPage() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [chartMode, setChartMode] = useState<"wallet" | "coin">("wallet");
  const [range, setRange] = useState<PortfolioRangeKey>("7d");
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const activeHolding = HOLDINGS[activeIdx];
  const activeCoin = coins.find((c) => c.id === activeHolding?.coinId);

  const walletSeries = useMemo(() => {
    if (coins.length === 0) return [] as number[];
    const len = 168;
    const out = new Array(len).fill(0);
    HOLDINGS.forEach((h) => {
      const c = coins.find((x) => x.id === h.coinId);
      if (!c) return;
      const pts = c.sparkline_in_7d?.price || [];
      const trimmed = pts.slice(-len);
      const padded =
        trimmed.length === len
          ? trimmed
          : [
              ...new Array(len - trimmed.length).fill(
                trimmed[0] || c.current_price,
              ),
              ...trimmed,
            ];
      for (let i = 0; i < len; i++) {
        out[i] += padded[i] * h.amount;
      }
    });
    return out;
  }, [coins]);

  const coinSeries = useMemo(() => {
    if (!activeCoin || !activeHolding) return [] as number[];
    const pts = activeCoin.sparkline_in_7d?.price || [];
    return pts.map((p) => p * activeHolding.amount);
  }, [activeCoin, activeHolding]);

  const series = chartMode === "wallet" ? walletSeries : coinSeries;

  const slicedSeries = useMemo(() => {
    const sl = range === "24h" ? -24 : range === "3d" ? -72 : -168;
    return series.slice(sl);
  }, [series, range]);

  const total = slicedSeries[slicedSeries.length - 1] ?? 0;
  const start = slicedSeries[0] ?? 0;
  const deltaAbs = total - start;
  const deltaPct = start > 0 ? ((total - start) / start) * 100 : 0;
  const pos = deltaAbs >= 0;

  const walletNow = walletSeries[walletSeries.length - 1] ?? 0;

  return (
    <div className="portfolio-page">
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
            <span
              style={{
                fontSize: 13,
                color: "var(--text)",
                fontWeight: 500,
              }}
            >
              Portfolio
            </span>
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
            className="header-theme-toggle"
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
          <ConnectWalletButton className="sign-in-btn" />
          <MobileMenuButton onOpen={() => setMenuOpen(true)} />
        </div>
      </header>

      <div className="portfolio-grid">
        <div className="left-col">
          {loading ? (
            <div className="card" style={{ padding: 24, height: 520 }}>
              <div className="skeleton" style={{ height: "100%" }} />
            </div>
          ) : (
            <HoldingsCarousel
              holdings={HOLDINGS}
              coins={coins}
              activeIdx={activeIdx}
              setActiveIdx={setActiveIdx}
            />
          )}
        </div>

        <div className="right-col">
          <section className="card chart-card portfolio-chart-card fade-up">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-faint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {chartMode === "wallet"
                    ? "Total portfolio value"
                    : `${activeCoin?.name || ""} investment`}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    className="mono"
                    style={{
                      fontSize: 42,
                      fontWeight: 500,
                      letterSpacing: "-0.025em",
                      lineHeight: 1,
                    }}
                  >
                    {loading ? (
                      <span
                        className="skeleton"
                        style={{
                          display: "inline-block",
                          width: 200,
                          height: 36,
                        }}
                      />
                    ) : (
                      fmtUSD(total)
                    )}
                  </div>
                  {!loading && (
                    <span
                      className={pos ? "chip chip-pos" : "chip chip-neg"}
                      style={{ padding: "5px 12px", fontSize: 12 }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path
                          d={
                            pos ? "M2 7 L5 3 L8 7" : "M2 3 L5 7 L8 3"
                          }
                          stroke="currentColor"
                          strokeWidth="1.6"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {pos ? "+" : ""}
                      {fmtUSD(Math.abs(deltaAbs))} ·{" "}
                      {(deltaPct >= 0 ? "+" : "") + deltaPct.toFixed(2)}%
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-faint)",
                    marginTop: 6,
                  }}
                >
                  {chartMode === "wallet"
                    ? `Across ${HOLDINGS.length} assets`
                    : `${fmtAmount(activeHolding?.amount)} ${
                        activeCoin?.symbol?.toUpperCase() || ""
                      }`}
                  {" · "}
                  {range.toUpperCase()}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 2,
                  padding: 3,
                  background: "var(--surface-2)",
                  borderRadius: 999,
                  border: "1px solid var(--border)",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => setChartMode("coin")}
                  style={{
                    padding: "7px 14px",
                    fontSize: 12,
                    fontWeight: 500,
                    borderRadius: 999,
                    background:
                      chartMode === "coin" ? "var(--text)" : "transparent",
                    color:
                      chartMode === "coin"
                        ? "var(--bg)"
                        : "var(--text-dim)",
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {activeCoin && <CoinGlyph coin={activeCoin} size={16} />}
                  This coin
                </button>
                <button
                  onClick={() => setChartMode("wallet")}
                  style={{
                    padding: "7px 14px",
                    fontSize: 12,
                    fontWeight: 500,
                    borderRadius: 999,
                    background:
                      chartMode === "wallet" ? "var(--text)" : "transparent",
                    color:
                      chartMode === "wallet"
                        ? "var(--bg)"
                        : "var(--text-dim)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Whole wallet
                </button>
              </div>
            </div>

            <div
              className="chart-h"
              style={{ width: "100%", flex: 1, minHeight: 240 }}
            >
              {loading || series.length === 0 ? (
                <div
                  className="skeleton"
                  style={{ height: "100%", borderRadius: 18 }}
                />
              ) : (
                <PortfolioChart series={series} range={range} showGrid />
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
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
                {RANGES.map((r) => (
                  <button
                    key={r.k}
                    onClick={() => setRange(r.k)}
                    style={{
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 500,
                      borderRadius: 999,
                      background:
                        range === r.k ? "var(--accent)" : "transparent",
                      color:
                        range === r.k ? "#04140A" : "var(--text-dim)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {chartMode === "coin" && activeCoin && (
                <Link
                  href={`/coin/${activeCoin.id}`}
                  style={{
                    fontSize: 12,
                    color: "var(--text-dim)",
                    textDecoration: "underline",
                    textDecorationColor: "var(--border-strong)",
                    textUnderlineOffset: 3,
                  }}
                >
                  Open {activeCoin.name} →
                </Link>
              )}
            </div>
          </section>

          <section
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
              <div
                style={{
                  fontSize: 11,
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontWeight: 600,
                }}
              >
                Allocation
              </div>
              <div
                className="mono"
                style={{ fontSize: 12, color: "var(--text-dim)" }}
              >
                Total {loading ? "—" : fmtUSD(walletNow)}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                height: 10,
                borderRadius: 999,
                overflow: "hidden",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              {!loading &&
                HOLDINGS.map((h, i) => {
                  const c = coins.find((x) => x.id === h.coinId);
                  if (!c || walletNow === 0) return null;
                  const v = c.current_price * h.amount;
                  const pct = (v / walletNow) * 100;
                  const isActive = i === activeIdx;
                  return (
                    <div
                      key={h.coinId}
                      title={`${c.name} · ${pct.toFixed(1)}%`}
                      onClick={() => setActiveIdx(i)}
                      style={{
                        width: pct + "%",
                        background: LEGEND_COLORS[i % LEGEND_COLORS.length],
                        opacity: isActive ? 1 : 0.7,
                        cursor: "pointer",
                        transition: "opacity 0.2s ease",
                        borderRight:
                          i < HOLDINGS.length - 1
                            ? "1px solid var(--bg)"
                            : "none",
                      }}
                    />
                  );
                })}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              {!loading &&
                HOLDINGS.map((h, i) => {
                  const c = coins.find((x) => x.id === h.coinId);
                  if (!c) return null;
                  const v = c.current_price * h.amount;
                  const pct = walletNow > 0 ? (v / walletNow) * 100 : 0;
                  const isActive = i === activeIdx;
                  return (
                    <button
                      key={h.coinId}
                      onClick={() => setActiveIdx(i)}
                      style={{
                        background: isActive
                          ? "var(--surface-2)"
                          : "transparent",
                        border:
                          "1px solid " +
                          (isActive
                            ? "var(--border-strong)"
                            : "transparent"),
                        borderRadius: 12,
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            LEGEND_COLORS[i % LEGEND_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-dim)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {c.symbol}
                        </div>
                        <div
                          className="mono"
                          style={{ fontSize: 12, color: "var(--text)" }}
                        >
                          {pct.toFixed(1)}%
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </section>
        </div>
      </div>

      <AIOrb open={chatOpen} setOpen={setChatOpen} pulse />
      <AIChatPanel
        open={chatOpen}
        setOpen={setChatOpen}
        coins={[activeCoin].filter((c): c is Coin => Boolean(c))}
      />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        current="portfolio"
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
    </div>
  );
}
