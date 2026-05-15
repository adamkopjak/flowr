"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useRef, useState } from "react";
import { useAccount, useBalance, useDisconnect, useSwitchChain } from "wagmi";

// =====================================================================
// Helpers
// =====================================================================
export function shortAddress(a: string | undefined | null): string {
  if (!a) return "—";
  if (a.length <= 12) return a;
  return a.slice(0, 6) + "…" + a.slice(-4);
}

function avatarGradient(address: string): [string, string] {
  if (!address) return ["#888", "#444"];
  let h1 = 0;
  let h2 = 0;
  const s = address.replace(/^0x/, "");
  for (let i = 0; i < Math.min(10, s.length); i++) h1 += s.charCodeAt(i);
  for (let i = Math.max(0, s.length - 8); i < s.length; i++)
    h2 += s.charCodeAt(i);
  return [
    `oklch(0.72 0.18 ${(h1 * 17) % 360})`,
    `oklch(0.50 0.22 ${(h2 * 23) % 360})`,
  ];
}

export function WalletAvatar({
  address,
  size = 28,
}: {
  address: string;
  size?: number;
}) {
  const [a, b] = avatarGradient(address);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${a}, ${b})`,
        flexShrink: 0,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px var(--border)",
      }}
    />
  );
}

const NETWORK_COLORS: Record<number, string> = {
  1: "#627EEA",
  42161: "#28A0F0",
  8453: "#0052FF",
  137: "#8247E5",
  10: "#FF0420",
};

function explorerUrl(chainId: number | undefined, address: string): string {
  switch (chainId) {
    case 42161:
      return `https://arbiscan.io/address/${address}`;
    case 8453:
      return `https://basescan.org/address/${address}`;
    case 137:
      return `https://polygonscan.com/address/${address}`;
    case 10:
      return `https://optimistic.etherscan.io/address/${address}`;
    default:
      return `https://etherscan.io/address/${address}`;
  }
}

// =====================================================================
// Details panel — shown when connected. Real data via wagmi hooks.
// =====================================================================
function WalletDetails({
  open,
  onClose,
  anchorRect,
  address,
  chainId,
  walletName,
}: {
  open: boolean;
  onClose: () => void;
  anchorRect: DOMRect | null;
  address: `0x${string}`;
  chainId: number | undefined;
  walletName: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [isSmall, setIsSmall] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address, chainId });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    function onChange() {
      setIsSmall(mq.matches);
    }
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        panelRef.current &&
        e.target instanceof Node &&
        !panelRef.current.contains(e.target)
      ) {
        onClose();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const t = setTimeout(
      () => document.addEventListener("mousedown", onDown),
      0,
    );
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function copy() {
    try {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  const top =
    anchorRect && typeof window !== "undefined"
      ? Math.min(anchorRect.bottom + 8, window.innerHeight - 460)
      : 64;

  const positionStyle: React.CSSProperties = isSmall
    ? {
        left: 14,
        right: 14,
        bottom: open ? 14 : -480,
        transition: "bottom 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }
    : {
        right: 16,
        top,
        width: 360,
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0)" : "translateY(-6px)",
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.18s ease, transform 0.22s ease",
      };

  const balanceDisplay = balance
    ? parseFloat(balance.formatted).toFixed(4)
    : "—";
  const symbol = balance?.symbol || "ETH";

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        style={{
          position: "fixed",
          inset: 0,
          background: isSmall ? "rgba(8,10,9,0.45)" : "transparent",
          backdropFilter: isSmall ? "blur(6px)" : "none",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.2s ease",
          zIndex: 95,
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-label="Wallet details"
        style={{
          position: "fixed",
          ...positionStyle,
          background: "var(--bg-elev)",
          border: "1px solid var(--border-strong)",
          borderRadius: 22,
          boxShadow:
            "0 24px 60px -16px rgba(0,0,0,0.55), 0 0 0 1px var(--border) inset",
          zIndex: 100,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <WalletAvatar address={address} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                className="mono"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
                  whiteSpace: "nowrap",
                }}
              >
                {shortAddress(address)}
              </span>
              <button
                onClick={copy}
                aria-label="Copy address"
                className="focus-ring"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--text-dim)",
                  padding: 0,
                }}
              >
                {copied ? (
                  <svg width="11" height="11" viewBox="0 0 12 12">
                    <path
                      d="M2.5 6.5 L5 9 L9.5 3.5"
                      stroke="var(--accent)"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 12 12">
                    <rect
                      x="3.5"
                      y="3.5"
                      width="6"
                      height="6"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      fill="none"
                    />
                    <path
                      d="M5.5 3.5 V 2.5 H 9 C 9.3 2.5, 9.5 2.7, 9.5 3 V 7"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      fill="none"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
            {walletName && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  marginTop: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {walletName}
                <span style={{ color: "var(--accent)", fontWeight: 500 }}>
                  · live
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            padding: "14px 16px",
            borderRadius: 16,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            Balance
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              {balanceDisplay}
            </span>
            <span
              style={{
                fontSize: 14,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {symbol}
            </span>
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 10,
              color: "var(--text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Network
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {chains.map((c) => {
              const active = chainId === c.id;
              const color = NETWORK_COLORS[c.id] || "var(--text-dim)";
              return (
                <button
                  key={c.id}
                  onClick={() => switchChain({ chainId: c.id })}
                  disabled={active}
                  className="focus-ring"
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 500,
                    background: active ? "var(--surface-2)" : "transparent",
                    border:
                      "1px solid " +
                      (active ? "var(--border-strong)" : "var(--border)"),
                    color: active ? "var(--text)" : "var(--text-dim)",
                    cursor: active ? "default" : "pointer",
                    fontFamily: "inherit",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: color,
                    }}
                  />
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            paddingTop: 8,
            borderTop: "1px solid var(--border)",
          }}
        >
          <a
            href={explorerUrl(chainId, address)}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "10px 12px",
              borderRadius: 12,
              color: "var(--text)",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M5 2 H 3 C 2.5 2, 2 2.5, 2 3 V 9 C 2 9.5, 2.5 10, 3 10 H 9 C 9.5 10, 10 9.5, 10 9 V 7"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M7 2 H 10 V 5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 7 L 10 2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            Explorer
          </a>
          <button
            onClick={() => {
              disconnect();
              onClose();
            }}
            className="focus-ring"
            style={{
              background: "rgba(255,107,122,0.08)",
              border: "1px solid rgba(255,107,122,0.22)",
              color: "var(--neg)",
              padding: "10px 12px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M5.5 2 H 3 C 2.5 2, 2 2.5, 2 3 V 9 C 2 9.5, 2.5 10, 3 10 H 5.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <path
                d="M7.5 4 L 10 6 L 7.5 8"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M10 6 H 5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            Disconnect
          </button>
        </div>
      </div>
    </>
  );
}

// =====================================================================
// Top-level button — uses RainbowKit's ConnectButton.Custom so the
// connection flow is real, but visuals stay flowr-native.
// =====================================================================
export function ConnectWalletButton({
  compact = false,
  fullWidth = false,
  className,
}: {
  compact?: boolean;
  fullWidth?: boolean;
  className?: string;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { connector } = useAccount();

  function openDetails() {
    if (triggerRef.current) {
      setAnchorRect(triggerRef.current.getBoundingClientRect());
    }
    setDetailsOpen(true);
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openChainModal, mounted }) => {
        const ready = mounted;
        const connected = ready && !!account && !!chain;
        const wrongNetwork = connected && chain.unsupported;

        const baseClass =
          "focus-ring" + (className ? " " + className : "");

        if (!ready) {
          return (
            <button
              className={baseClass}
              aria-hidden
              style={{
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
                background: "var(--accent)",
                color: "#04140A",
                border: "1px solid var(--accent)",
                padding: compact ? "8px 10px" : "9px 16px 9px 12px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                width: fullWidth ? "100%" : "auto",
              }}
            >
              Connect wallet
            </button>
          );
        }

        if (!connected) {
          return (
            <button
              ref={triggerRef}
              onClick={openConnectModal}
              className={baseClass}
              style={{
                background: "var(--accent)",
                color: "#04140A",
                border: "1px solid var(--accent)",
                padding: compact ? "8px 10px" : "9px 16px 9px 12px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                width: fullWidth ? "100%" : "auto",
                justifyContent: fullWidth ? "center" : "flex-start",
                boxShadow: "0 4px 14px -4px var(--accent-glow)",
                transition: "transform 0.12s ease",
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.97)")
              }
              onMouseUp={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect
                  x="1.5"
                  y="3"
                  width="11"
                  height="8"
                  rx="1.6"
                  stroke="#04140A"
                  strokeWidth="1.4"
                />
                <path
                  d="M1.5 5.5 H 12.5"
                  stroke="#04140A"
                  strokeWidth="1.4"
                />
                <circle cx="9" cy="7.5" r="1" fill="#04140A" />
              </svg>
              {compact ? "Connect" : "Connect wallet"}
            </button>
          );
        }

        if (wrongNetwork) {
          return (
            <button
              onClick={openChainModal}
              className={baseClass}
              style={{
                background: "rgba(255,107,122,0.10)",
                color: "var(--neg)",
                border: "1px solid rgba(255,107,122,0.30)",
                padding: compact ? "8px 12px" : "9px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                width: fullWidth ? "100%" : "auto",
              }}
            >
              Wrong network
            </button>
          );
        }

        return (
          <>
            <button
              ref={triggerRef}
              onClick={openDetails}
              className={baseClass}
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border-strong)",
                padding: compact ? "5px 9px 5px 5px" : "5px 12px 5px 5px",
                borderRadius: 999,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                width: fullWidth ? "100%" : "auto",
                justifyContent: "flex-start",
                fontSize: 13,
                fontWeight: 500,
                transition:
                  "border-color 0.15s ease, background 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--surface-2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--surface)")
              }
            >
              <WalletAvatar address={account.address} size={26} />
              {!compact && (
                <>
                  <span
                    className="mono"
                    style={{ letterSpacing: "-0.005em" }}
                  >
                    {shortAddress(account.address)}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 10,
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                      border: "1px solid rgba(78,254,154,0.22)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "var(--accent)",
                        boxShadow: "0 0 6px var(--accent-glow)",
                      }}
                    />
                    live
                  </span>
                </>
              )}
            </button>
            <WalletDetails
              open={detailsOpen}
              onClose={() => setDetailsOpen(false)}
              anchorRect={anchorRect}
              address={account.address as `0x${string}`}
              chainId={chain.id}
              walletName={connector?.name ?? null}
            />
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}
