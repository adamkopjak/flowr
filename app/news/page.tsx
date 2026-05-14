"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AIChatPanel, AIOrb } from "@/components/AIChat";
import { FlowrLogo } from "@/components/FlowrLogo";
import { MobileMenu, MobileMenuButton } from "@/components/MobileMenu";
import { NewsCard } from "@/components/NewsCard";
import { SentimentSummary } from "@/components/SentimentSummary";
import {
  analyzeArticle,
  fetchNews,
  type Article,
  type Sentiment,
} from "@/lib/news";
import { readInitialTheme, type Theme } from "@/lib/theme";

type Status = "idle" | "loading" | "done" | "error";
type FilterKey = "all" | "unanalyzed" | "bullish" | "neutral" | "bearish";

const FILTERS: { k: FilterKey; label: string; dot: string | null }[] = [
  { k: "all", label: "All", dot: null },
  { k: "unanalyzed", label: "Unanalyzed", dot: "var(--text-faint)" },
  { k: "bullish", label: "Bullish", dot: "var(--pos)" },
  { k: "neutral", label: "Neutral", dot: "var(--text-faint)" },
  { k: "bearish", label: "Bearish", dot: "var(--neg)" },
];

export default function NewsPage() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [articles, setArticles] = useState<Article[]>([]);
  const [source, setSource] = useState<"loading" | "live" | "fallback">(
    "loading",
  );
  const [loading, setLoading] = useState(true);
  const [sentiments, setSentiments] = useState<
    Record<string, Sentiment | undefined>
  >({});
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
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
    fetchNews().then(({ articles, source }) => {
      if (cancelled) return;
      setArticles(articles);
      setSource(source);
      setLoading(false);
    });
    const id = setInterval(
      () => {
        fetchNews().then(({ articles, source }) => {
          if (cancelled) return;
          setArticles(articles);
          setSource(source);
        });
      },
      5 * 60 * 1000,
    );
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  async function analyzeOne(article: Article): Promise<Sentiment> {
    setStatuses((s) => ({ ...s, [article.id]: "loading" }));
    const result = await analyzeArticle({
      headline: article.headline,
      snippet: article.snippet,
      tags: article.tags,
    });
    setSentiments((s) => ({ ...s, [article.id]: result }));
    setStatuses((s) => ({ ...s, [article.id]: "done" }));
    return result;
  }

  async function analyzeAll() {
    if (articles.length === 0) return;
    setAnalyzingAll(true);
    const queue = articles.filter((a) => !sentiments[a.id]);
    const CONCURRENCY = 3;
    let i = 0;
    async function worker() {
      while (i < queue.length) {
        const idx = i++;
        await analyzeOne(queue[idx]);
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    setAnalyzingAll(false);
  }

  const filteredArticles = useMemo(() => {
    if (filter === "all") return articles;
    if (filter === "unanalyzed")
      return articles.filter((a) => !sentiments[a.id]);
    return articles.filter((a) => sentiments[a.id]?.verdict === filter);
  }, [filter, articles, sentiments]);

  return (
    <div className="news-page">
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
              News
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
          <MobileMenuButton onOpen={() => setMenuOpen(true)} />
        </div>
      </header>

      <div style={{ marginBottom: 16 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          News
        </h1>
        <p
          style={{
            margin: "6px 0 0",
            color: "var(--text-dim)",
            fontSize: 14,
            maxWidth: 640,
          }}
        >
          Headlines from across the crypto markets. Tap{" "}
          <span style={{ color: "var(--text)", fontWeight: 500 }}>Ask AI</span>{" "}
          on any story for an instant bullish / bearish / neutral read.
        </p>
      </div>

      <div style={{ marginBottom: 18 }}>
        <SentimentSummary
          sentiments={sentiments}
          total={articles.length}
          onAnalyzeAll={analyzeAll}
          analyzingAll={analyzingAll}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.k;
          return (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className="focus-ring"
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 13,
                background: active ? "var(--text)" : "var(--surface)",
                color: active ? "var(--bg)" : "var(--text-dim)",
                border:
                  "1px solid " + (active ? "var(--text)" : "var(--border)"),
                cursor: "pointer",
                fontWeight: active ? 600 : 500,
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                transition: "all 0.15s ease",
              }}
            >
              {f.dot && (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: f.dot,
                  }}
                />
              )}
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="news-grid">
        {loading
          ? [0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="card"
                style={{ height: 360, padding: 0, overflow: "hidden" }}
              >
                <div
                  className="skeleton"
                  style={{ height: 132, borderRadius: 0 }}
                />
                <div
                  style={{
                    padding: "30px 18px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    className="skeleton"
                    style={{ height: 14, width: "40%" }}
                  />
                  <div className="skeleton" style={{ height: 20 }} />
                  <div className="skeleton" style={{ height: 14 }} />
                  <div
                    className="skeleton"
                    style={{ height: 14, width: "85%" }}
                  />
                </div>
              </div>
            ))
          : filteredArticles.map((article, i) => (
              <NewsCard
                key={article.id}
                article={article}
                sentiment={sentiments[article.id]}
                status={statuses[article.id]}
                onAnalyze={analyzeOne}
                animDelay={i * 40}
              />
            ))}
      </div>

      {!loading && filteredArticles.length === 0 && (
        <div
          className="card"
          style={{
            padding: 40,
            textAlign: "center",
            color: "var(--text-dim)",
          }}
        >
          No stories match this filter.
        </div>
      )}

      <footer
        style={{
          marginTop: 24,
          fontSize: 11,
          color: "var(--text-faint)",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span>
          flowr. ·{" "}
          {source === "live"
            ? "headlines from Cointelegraph, CoinDesk, Decrypt"
            : source === "fallback"
              ? "demo headlines"
              : "loading…"}{" "}
          · refresh every 5 minutes
        </span>
        <span>AI sentiment via Groq</span>
      </footer>

      <AIOrb open={chatOpen} setOpen={setChatOpen} pulse />
      <AIChatPanel open={chatOpen} setOpen={setChatOpen} coins={[]} />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        current="news"
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
    </div>
  );
}
