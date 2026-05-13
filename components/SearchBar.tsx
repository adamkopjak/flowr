"use client";

export type FilterKey = "all" | "gainers" | "losers" | "watch";

const FILTERS: { k: FilterKey; label: string }[] = [
  { k: "all", label: "All" },
  { k: "gainers", label: "Gainers" },
  { k: "losers", label: "Losers" },
  { k: "watch", label: "★ Watchlist" },
];

export function SearchBar({
  q,
  setQ,
  filter,
  setFilter,
}: {
  q: string;
  setQ: (v: string) => void;
  filter: FilterKey;
  setFilter: (f: FilterKey) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          flex: "1 1 320px",
          minWidth: 260,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 999,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle
            cx="7"
            cy="7"
            r="5"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <path
            d="M11 11 L14 14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Bitcoin, Solana, …"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text)",
            fontSize: 14,
            fontFamily: "inherit",
          }}
        />
        {q && (
          <button
            onClick={() => setQ("")}
            style={{
              background: "var(--surface-2)",
              border: "none",
              color: "var(--text-dim)",
              borderRadius: 999,
              padding: "2px 8px",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            clear
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {FILTERS.map((f) => {
          const active = filter === f.k;
          return (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              style={{
                padding: "9px 14px",
                borderRadius: 999,
                fontSize: 13,
                background: active ? "var(--text)" : "var(--surface)",
                color: active ? "var(--bg)" : "var(--text-dim)",
                border:
                  "1px solid " + (active ? "var(--text)" : "var(--border)"),
                cursor: "pointer",
                fontWeight: active ? 600 : 500,
                transition: "all 0.2s ease",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
