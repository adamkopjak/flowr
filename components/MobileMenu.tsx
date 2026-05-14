"use client";

import Link from "next/link";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import { FlowrLogo } from "@/components/FlowrLogo";
import type { Theme } from "@/lib/theme";

export type MobileMenuKey = "markets" | "portfolio" | "coin" | "watchlist";

export function MobileMenuButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Open menu"
      className="mobile-menu-btn focus-ring"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        width: 38,
        height: 38,
        borderRadius: "50%",
        cursor: "pointer",
        color: "var(--text)",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <line
          x1="2.5"
          y1="5"
          x2="13.5"
          y2="5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="2.5"
          y1="8"
          x2="13.5"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="2.5"
          y1="11"
          x2="13.5"
          y2="11"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

type Item = {
  key: MobileMenuKey;
  label: string;
  href: string;
  desc: string;
  icon: ReactNode;
};

const ITEMS: Item[] = [
  {
    key: "markets",
    label: "Markets",
    href: "/",
    desc: "Top coins, gainers and losers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M2 13 L6 8 L9 11 L16 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="4" r="1.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "portfolio",
    label: "Portfolio",
    href: "/portfolio",
    desc: "Your holdings and value",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect
          x="2.5"
          y="4"
          width="13"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M2.5 7 H 15.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="10.5" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "coin",
    label: "Coin detail",
    href: "/coin/bitcoin",
    desc: "Deep-dive on any asset",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M9 5 V 9 L11.5 11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "watchlist",
    label: "Watchlist",
    href: "/",
    desc: "Coins you've starred",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 2.5 L10.85 6.4 L15 6.95 L11.95 9.85 L12.75 14 L9 11.95 L5.25 14 L6.05 9.85 L3 6.95 L7.15 6.4 Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function MobileMenu({
  open,
  onClose,
  current,
  theme,
  onToggleTheme,
}: {
  open: boolean;
  onClose: () => void;
  current: MobileMenuKey;
  theme: Theme;
  onToggleTheme: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(8,10,9,0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
          zIndex: 90,
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        style={{
          position: "fixed",
          left: "50%",
          bottom: open ? 14 : -540,
          transform: "translateX(-50%)",
          width: "calc(100vw - 28px)",
          maxWidth: 460,
          background: "var(--bg-elev)",
          border: "1px solid var(--border-strong)",
          borderRadius: 28,
          boxShadow:
            "0 24px 60px -20px rgba(0,0,0,0.55), 0 0 0 1px var(--border) inset",
          zIndex: 100,
          transition: "bottom 0.32s cubic-bezier(0.2, 0.8, 0.2, 1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "10px 0 4px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 999,
              background: "var(--border-strong)",
            }}
          />
        </div>

        <div
          style={{
            padding: "8px 20px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <FlowrLogo size={26} />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="focus-ring"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              width: 32,
              height: 32,
              borderRadius: "50%",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              color: "var(--text-dim)",
              padding: 0,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11">
              <path
                d="M2 2 L9 9 M9 2 L2 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav
          style={{
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {ITEMS.map((it, i) => {
            const isCurrent = it.key === current;
            const linkStyle: CSSProperties = {
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 12px",
              borderRadius: 18,
              textDecoration: "none",
              color: "var(--text)",
              background: isCurrent ? "var(--accent-soft)" : "transparent",
              border:
                "1px solid " +
                (isCurrent ? "rgba(78,254,154,0.25)" : "transparent"),
              transition: "background 0.15s ease",
              animation: open
                ? `fadeUp 0.4s ${0.05 + i * 0.04}s ease-out both`
                : "none",
            };
            return (
              <Link
                key={it.key}
                href={it.href}
                onClick={onClose}
                aria-current={isCurrent ? "page" : undefined}
                style={linkStyle}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    background: isCurrent
                      ? "var(--accent)"
                      : "var(--surface-2)",
                    color: isCurrent ? "#04140A" : "var(--text-dim)",
                    border:
                      "1px solid " +
                      (isCurrent ? "var(--accent)" : "var(--border)"),
                  }}
                >
                  {it.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: "var(--text)",
                    }}
                  >
                    {it.label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-dim)",
                      marginTop: 1,
                    }}
                  >
                    {it.desc}
                  </div>
                </div>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  style={{
                    color: isCurrent ? "var(--accent)" : "var(--text-faint)",
                  }}
                >
                  <path
                    d="M3.5 2 L7 5 L3.5 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            padding: "12px 16px 18px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={onToggleTheme}
            className="focus-ring"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "10px 14px",
              borderRadius: 999,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "inherit",
              color: "var(--text)",
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "var(--surface-2)",
                display: "grid",
                placeItems: "center",
              }}
            >
              {theme === "dark" ? (
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
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
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12.5 9.5 A 5 5 0 1 1 6.5 3.5 A 4 4 0 0 0 12.5 9.5 Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </span>
            {theme === "dark" ? "Dark" : "Light"}
          </button>

          <button
            className="focus-ring"
            style={{
              background: "var(--text)",
              color: "var(--bg)",
              border: "none",
              padding: "11px 18px",
              borderRadius: 999,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              flex: 1,
              maxWidth: 200,
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    </>
  );
}
