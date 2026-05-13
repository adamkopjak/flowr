"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Coin } from "@/lib/coingecko";
import { fmtPrice } from "@/lib/format";
import { CoinGlyph } from "./CoinGlyph";

export function ComparePicker({
  coins,
  activeIds,
  onAdd,
}: {
  coins: Coin[];
  activeIds: string[];
  onAdd: (c: Coin) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const list = useMemo(() => {
    return coins
      .filter((c) => !activeIds.includes(c.id))
      .filter((c) => {
        if (!q.trim()) return true;
        const n = q.toLowerCase();
        return (
          c.name.toLowerCase().includes(n) ||
          c.symbol.toLowerCase().includes(n)
        );
      })
      .slice(0, 20);
  }, [coins, activeIds, q]);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Add to compare"
        style={{
          background: open ? "var(--accent)" : "var(--surface)",
          color: open ? "#04140A" : "var(--text)",
          border:
            "1px solid " + (open ? "var(--accent)" : "var(--border-strong)"),
          borderRadius: 999,
          padding: "8px 14px 8px 10px",
          fontSize: 13,
          fontWeight: 500,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: open ? "#04140A22" : "var(--surface-2)",
            color: open ? "#04140A" : "var(--text)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M5 1 V9 M1 5 H9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
        Compare
      </button>

      {open && (
        <div
          className="compare-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 50,
            width: 280,
            background: "var(--bg-elev)",
            border: "1px solid var(--border-strong)",
            borderRadius: 20,
            boxShadow: "0 20px 60px -20px rgba(0,0,0,0.55)",
            padding: 10,
          }}
        >
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a coin to add…"
            style={{
              width: "100%",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "10px 14px",
              fontSize: 13,
              outline: "none",
              color: "var(--text)",
              fontFamily: "inherit",
              marginBottom: 8,
            }}
          />
          <div
            style={{
              maxHeight: 300,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {list.length === 0 ? (
              <div
                style={{
                  padding: "14px",
                  fontSize: 12,
                  color: "var(--text-dim)",
                  textAlign: "center",
                }}
              >
                No matches
              </div>
            ) : (
              list.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onAdd(c);
                    setOpen(false);
                    setQ("");
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 10px",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }}
                >
                  <CoinGlyph coin={c} size={24} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.name}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-dim)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {c.symbol}
                    </div>
                  </div>
                  <span
                    className="mono"
                    style={{ fontSize: 12, color: "var(--text-dim)" }}
                  >
                    ${fmtPrice(c.current_price)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
