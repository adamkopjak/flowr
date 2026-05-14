"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AIChatPanel, AIOrb } from "@/components/AIChat";
import { ChartCard } from "@/components/ChartCard";
import { FlowrLogo } from "@/components/FlowrLogo";
import { MarketTicker } from "@/components/MarketTicker";
import { MobileMenu, MobileMenuButton } from "@/components/MobileMenu";
import { ConnectWalletButton } from "@/components/Wallet";
import { MoverCard } from "@/components/MoverCard";
import { PriceRow, PriceRowHeader } from "@/components/PriceRow";
import { SearchBar, type FilterKey } from "@/components/SearchBar";
import { SectionTitle, SkeletonCard } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";
import { fetchCoins, type Coin } from "@/lib/coingecko";
import { fmtBig } from "@/lib/format";
import { readInitialTheme, type Theme } from "@/lib/theme";

const NAV: { label: string; href: string }[] = [
  { label: "Markets", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Watchlist", href: "#" },
  { label: "News", href: "#" },
];

export default function Page() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [source, setSource] = useState<"loading" | "live" | "fallback">(
    "loading",
  );
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [watch, setWatch] = useState<Set<string>>(new Set());
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const goToCoin = (coin: Coin) => router.push(`/coin/${coin.id}`);

  useEffect(() => {
    try {
      const w = JSON.parse(
        localStorage.getItem("flowr-watch") || "[]",
      ) as string[];
      if (Array.isArray(w)) setWatch(new Set(w));
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("flowr-theme", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCoins().then(({ coins, source }) => {
      if (cancelled) return;
      setCoins(coins);
      setSource(source);
      setLoading(false);
    });
    const id = setInterval(() => {
      fetchCoins().then(({ coins, source }) => {
        if (cancelled) return;
        setCoins(coins);
        setSource(source);
      });
    }, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  function toggleWatch(id: string) {
    setWatch((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("flowr-watch", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  const topMovers = useMemo(
    () =>
      [...coins]
        .filter((c) => c.price_change_percentage_24h != null)
        .sort(
          (a, b) =>
            Math.abs(b.price_change_percentage_24h ?? 0) -
            Math.abs(a.price_change_percentage_24h ?? 0),
        )
        .slice(0, 3),
    [coins],
  );

  const featured = useMemo(
    () =>
      [...coins]
        .sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
        .slice(0, 3),
    [coins],
  );

  const filtered = useMemo(() => {
    let list = coins;
    if (q.trim()) {
      const needle = q.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(needle) ||
          c.symbol.toLowerCase().includes(needle),
      );
    }
    if (filter === "gainers")
      list = list.filter((c) => (c.price_change_percentage_24h ?? 0) > 0);
    if (filter === "losers")
      list = list.filter((c) => (c.price_change_percentage_24h ?? 0) < 0);
    if (filter === "watch") list = list.filter((c) => watch.has(c.id));
    return list;
  }, [coins, q, filter, watch]);

  const summary = useMemo(() => {
    const totalMcap = coins.reduce((s, c) => s + (c.market_cap || 0), 0);
    const totalVol = coins.reduce((s, c) => s + (c.total_volume || 0), 0);
    const gainers = coins.filter(
      (c) => (c.price_change_percentage_24h ?? 0) > 0,
    ).length;
    const losers = coins.filter(
      (c) => (c.price_change_percentage_24h ?? 0) < 0,
    ).length;
    const avgChg = coins.length
      ? coins.reduce((s, c) => s + (c.price_change_percentage_24h || 0), 0) /
        coins.length
      : 0;
    return { totalMcap, totalVol, gainers, losers, avgChg };
  }, [coins]);

  return (
    <div className="app-wrap">
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <FlowrLogo size={30} />
          <nav className="nav-links">
            {NAV.map((n, i) => (
              <a
                key={n.label}
                href={n.href}
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  borderRadius: 999,
                  color: i === 0 ? "var(--text)" : "var(--text-dim)",
                  background: i === 0 ? "var(--surface-2)" : "transparent",
                  textDecoration: "none",
                  fontWeight: i === 0 ? 500 : 400,
                  border:
                    "1px solid " +
                    (i === 0 ? "var(--border)" : "transparent"),
                }}
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            className="chip header-live-chip"
            style={{ padding: "6px 12px" }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background:
                  source === "live"
                    ? "var(--accent)"
                    : "var(--text-faint)",
                boxShadow:
                  source === "live" ? "0 0 6px var(--accent-glow)" : "none",
              }}
            />
            <span className="data-chip-text">
              {source === "live"
                ? "Live data"
                : source === "fallback"
                  ? "Demo data"
                  : "Connecting…"}
            </span>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="header-theme-toggle"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              width: 40,
              height: 40,
              borderRadius: "50%",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              color: "var(--text)",
              flexShrink: 0,
            }}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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

      <section className="grid-stats" style={{ marginBottom: 24 }}>
        <StatCard
          label="Total market cap"
          value={"$" + fmtBig(summary.totalMcap)}
          sub={
            (summary.avgChg >= 0 ? "▲ " : "▼ ") +
            Math.abs(summary.avgChg).toFixed(2) +
            "% avg 24h"
          }
        />
        <StatCard
          label="24h volume"
          value={"$" + fmtBig(summary.totalVol)}
          sub="across tracked assets"
        />
        <StatCard
          label="Gainers"
          value={summary.gainers || "—"}
          sub="up in last 24 hours"
          accent="var(--pos)"
        />
        <StatCard
          label="Losers"
          value={summary.losers || "—"}
          sub="down in last 24 hours"
          accent="var(--neg)"
        />
      </section>

      <section style={{ marginBottom: 18 }}>
        <SectionTitle
          eyebrow="Today"
          title="Biggest movers"
          subtitle={`The 3 most volatile assets in the last 24h${
            source === "fallback" ? " — demo data" : ""
          }.`}
        />
      </section>
      <section className="grid-three" style={{ marginBottom: 28 }}>
        {loading || coins.length === 0
          ? [0, 1, 2].map((i) => <SkeletonCard key={i} h={220} />)
          : topMovers.map((c, i) => (
              <MoverCard key={c.id} coin={c} rank={i} onSelect={goToCoin} />
            ))}
      </section>

      <section style={{ marginBottom: 18 }}>
        <SectionTitle
          eyebrow="Featured"
          title="Major markets"
          subtitle="7-day price action for the top three by market cap."
        />
      </section>
      <section className="grid-three" style={{ marginBottom: 28 }}>
        {loading || coins.length === 0
          ? [0, 1, 2].map((i) => <SkeletonCard key={i} h={240} />)
          : featured.map((c) => (
              <ChartCard key={c.id} coin={c} onSelect={goToCoin} />
            ))}
      </section>

      {coins.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <MarketTicker coins={coins} />
        </section>
      )}

      <section
        style={{
          marginBottom: 18,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <SectionTitle
          eyebrow="All assets"
          title="Live prices"
          subtitle="Tap any row to focus, ★ to add to your watchlist."
        />
      </section>
      <section style={{ marginBottom: 24 }}>
        <SearchBar q={q} setQ={setQ} filter={filter} setFilter={setFilter} />
      </section>

      <section className="card" style={{ padding: 8 }}>
        <PriceRowHeader />

        {loading || coins.length === 0 ? (
          [0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ padding: "14px 18px" }}>
              <div
                className="skeleton"
                style={{ height: 24, borderRadius: 12 }}
              />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: "40px 18px",
              textAlign: "center",
              color: "var(--text-dim)",
              fontSize: 14,
            }}
          >
            No assets match those filters.
          </div>
        ) : (
          filtered.map((c, i) => (
            <PriceRow
              key={c.id}
              coin={c}
              idx={i}
              isWatched={watch.has(c.id)}
              onWatch={toggleWatch}
              onSelect={goToCoin}
            />
          ))
        )}
      </section>

      <footer
        style={{
          marginTop: 40,
          fontSize: 12,
          color: "var(--text-faint)",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span>flowr. · prices from CoinGecko · refresh every 60s</span>
        <span>{coins.length} assets tracked</span>
        <span>Made by: adamkopjak</span>
      </footer>

      <AIOrb open={chatOpen} setOpen={setChatOpen} pulse />
      <AIChatPanel open={chatOpen} setOpen={setChatOpen} coins={coins} />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        current="markets"
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
    </div>
  );
}
