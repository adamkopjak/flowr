"use client";

import { useEffect, useRef, useState } from "react";
import type { Coin } from "@/lib/coingecko";

export function AIOrb({
  open,
  setOpen,
  pulse = true,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  pulse?: boolean;
}) {
  return (
    <button
      onClick={() => setOpen(!open)}
      aria-label="Open flowr AI"
      className={pulse && !open ? "orb-pulse" : ""}
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 90,
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "var(--accent)",
        border: "none",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        color: "#04140A",
        transition: "transform 0.25s cubic-bezier(.2,.8,.2,1)",
        transform: open ? "scale(0.92) rotate(45deg)" : "scale(1)",
      }}
    >
      {open ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6 L18 18 M18 6 L6 18"
            stroke="#04140A"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3 L13.4 9.6 L20 11 L13.4 12.4 L12 19 L10.6 12.4 L4 11 L10.6 9.6 Z"
            fill="#04140A"
          />
          <circle cx="18.5" cy="5.5" r="1.4" fill="#04140A" />
          <circle cx="5.5" cy="18" r="1.1" fill="#04140A" />
        </svg>
      )}
    </button>
  );
}

const SUGGESTIONS = [
  "What is Bitcoin?",
  "Why did SOL pump today?",
  "Explain market cap vs. volume",
  "Compare ETH and SOL last 7 days",
];

type Msg = { role: "bot" | "user"; text: string };

function buildStubReply(q: string, coins: Coin[]): string {
  const needle = q.toLowerCase();
  const match = coins.find(
    (c) =>
      needle.includes(c.symbol.toLowerCase()) ||
      needle.includes(c.name.toLowerCase()),
  );
  if (match) {
    const dir =
      (match.price_change_percentage_24h ?? 0) >= 0 ? "up" : "down";
    return `${match.name} (${match.symbol.toUpperCase()}) is trading near $${match.current_price.toLocaleString()}, ${dir} ${Math.abs(
      match.price_change_percentage_24h ?? 0,
    ).toFixed(2)}% in the last 24h. Connect your own LLM endpoint to /api/chat for richer answers.`;
  }
  return "I'm a placeholder for now — wire up your own LLM at /api/chat to get real answers. Try asking about a specific coin (e.g. BTC, ETH, SOL).";
}

export function AIChatPanel({
  open,
  setOpen,
  coins,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  coins: Coin[];
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text:
        "Hey, I'm flowr AI. Ask me about any coin — history, market moves, or how things work.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, loading, open]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);

    await new Promise((res) => setTimeout(res, 600));
    setMessages((m) => [
      ...m,
      {
        role: "bot",
        text: buildStubReply(q, coins),
      },
    ]);
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        bottom: 100,
        zIndex: 89,
        width: 380,
        maxWidth: "calc(100vw - 48px)",
        height: 540,
        maxHeight: "calc(100vh - 140px)",
        borderRadius: 28,
        background: "var(--bg-elev)",
        border: "1px solid var(--border-strong)",
        boxShadow:
          "0 30px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "fadeUp 0.3s ease-out",
      }}
    >
      <div
        style={{
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 16px var(--accent-glow)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                d="M12 3 L13.4 9.6 L20 11 L13.4 12.4 L12 19 L10.6 12.4 L4 11 L10.6 9.6 Z"
                fill="#04140A"
              />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              flowr AI
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-dim)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              />
              Online · ask anything
            </div>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "var(--surface-2)",
            border: "none",
            color: "var(--text-dim)",
            width: 30,
            height: 30,
            borderRadius: "50%",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M3 3 L9 9 M9 3 L3 9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div
        ref={bodyRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              className={m.role === "user" ? "bubble-user" : "bubble-bot"}
              style={{
                maxWidth: "82%",
                padding: "10px 14px",
                fontSize: 13.5,
                lineHeight: 1.5,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              className="bubble-bot"
              style={{ padding: "12px 14px", display: "flex", gap: 4 }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="typing-dot"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--text-dim)",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {messages.length === 1 && !loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 6,
            }}
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-dim)",
                  fontFamily: "inherit",
                  fontSize: 13,
                  borderRadius: 14,
                  cursor: "pointer",
                }}
              >
                ↳ {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          padding: 14,
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Ask flowr AI…"
          style={{
            flex: 1,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 999,
            padding: "10px 16px",
            fontSize: 13,
            outline: "none",
            color: "var(--text)",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{
            background: "var(--accent)",
            border: "none",
            width: 38,
            height: 38,
            borderRadius: "50%",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            color: "#04140A",
            opacity: !input.trim() || loading ? 0.4 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8 L13 8 M9 4 L13 8 L9 12"
              stroke="#04140A"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
