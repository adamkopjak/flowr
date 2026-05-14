"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

// =====================================================================
// Types
// =====================================================================
export type WalletState =
  | { connected: false }
  | {
      connected: true;
      walletId: string;
      walletName: string;
      address: string;
      real: boolean;
      balance: string;
      network: string;
      networkId: string;
      connectedAt: number;
    };

type WalletActions = {
  connect: (walletId: string) => Promise<WalletState>;
  disconnect: () => void;
  setNetwork: (networkId: string) => void;
};

type WalletOption = {
  id: string;
  name: string;
  desc: string;
  popular?: boolean;
  bg: string;
  mark?: string;
  iconSvg?: ReactElement<{ width?: number | string; height?: number | string }>;
  network: string;
};

// =====================================================================
// Catalog
// =====================================================================
const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    desc: "Browser extension",
    popular: true,
    bg: "linear-gradient(135deg, #F6851B, #E2761B)",
    mark: "M",
    network: "Ethereum",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    desc: "Scan with mobile",
    popular: true,
    bg: "linear-gradient(135deg, #3B99FC, #1E6FE5)",
    iconSvg: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M5.5 9 C 7 7.4, 9.4 7, 11 8 C 12.6 9, 15 9.4, 16.5 9"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M4 13 C 6 11, 9.4 10.4, 11 12 C 12.6 13.6, 16 13, 18 13"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
    network: "Multi-chain",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    desc: "Self-custody",
    bg: "linear-gradient(135deg, #1652F0, #0A36C7)",
    iconSvg: (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <circle cx="11" cy="11" r="8.5" fill="#fff" opacity="0.18" />
        <circle cx="11" cy="11" r="6" stroke="#fff" strokeWidth="1.8" fill="none" />
        <rect x="9" y="9" width="4" height="4" rx="1" fill="#fff" />
      </svg>
    ),
    network: "Ethereum",
  },
  {
    id: "phantom",
    name: "Phantom",
    desc: "Solana wallet",
    bg: "linear-gradient(135deg, #AB9FF2, #5547D6)",
    iconSvg: (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <path
          d="M4 11 C 4 6.6, 7.1 4, 11 4 C 14.9 4, 18 6.6, 18 11 V 16.5 C 18 17.4, 17.2 17.5, 16.6 17 L 15.4 16 C 14.9 15.6, 14.2 15.6, 13.7 16 L 12.8 16.8 C 12.3 17.2, 11.6 17.2, 11.1 16.8 L 10.2 16 C 9.7 15.6, 9 15.6, 8.5 16 L 7.3 17 C 6.7 17.5, 5.9 17.4, 5.9 16.5 V 14 Z"
          fill="#fff"
        />
        <circle cx="9.2" cy="10" r="1.2" fill="#5547D6" />
        <circle cx="13.2" cy="10" r="1.2" fill="#5547D6" />
      </svg>
    ),
    network: "Solana",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    desc: "Mobile wallet",
    bg: "linear-gradient(135deg, #FF4000, #FF80B5 35%, #4D86FF 70%, #4DE0BC)",
    mark: "",
    iconSvg: (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <path
          d="M3 16.5 A 8 8 0 0 1 19 16.5"
          stroke="#fff"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M5 16.5 A 6 6 0 0 1 17 16.5"
          stroke="#fff"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M7 16.5 A 4 4 0 0 1 15 16.5"
          stroke="#fff"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          opacity="0.45"
        />
      </svg>
    ),
    network: "Multi-chain",
  },
  {
    id: "ledger",
    name: "Ledger",
    desc: "Hardware wallet",
    bg: "linear-gradient(135deg, #2A2A2D, #0E0E10)",
    iconSvg: (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <rect
          x="3.5"
          y="3.5"
          width="15"
          height="15"
          rx="2"
          stroke="#fff"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M7.5 7 V 15 H 14.5"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
    network: "Hardware",
  },
];

const FEATURED_NETWORKS = [
  { id: "ethereum", name: "Ethereum", color: "#627EEA" },
  { id: "solana", name: "Solana", color: "#9945FF" },
  { id: "arbitrum", name: "Arbitrum", color: "#28A0F0" },
  { id: "base", name: "Base", color: "#0052FF" },
  { id: "polygon", name: "Polygon", color: "#8247E5" },
];

// =====================================================================
// Shared state across all components / pages
// =====================================================================
const WALLET_STATE_KEY = "flowr-wallet";
const WALLET_CHANGE_EVENT = "flowr-wallet-changed";

function loadWalletFromStorage(): WalletState {
  if (typeof window === "undefined") return { connected: false };
  try {
    const v = JSON.parse(localStorage.getItem(WALLET_STATE_KEY) || "null");
    return v && v.connected ? (v as WalletState) : { connected: false };
  } catch {
    return { connected: false };
  }
}

function saveWalletToStorage(s: WalletState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WALLET_STATE_KEY, JSON.stringify(s));
  } catch {}
  window.dispatchEvent(new CustomEvent(WALLET_CHANGE_EVENT));
}

export function useWallet(): [WalletState, WalletActions] {
  const [state, setState] = useState<WalletState>(loadWalletFromStorage);

  useEffect(() => {
    function refresh() {
      setState(loadWalletFromStorage());
    }
    window.addEventListener(WALLET_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    // Sync on mount in case SSR returned `connected: false`
    refresh();
    return () => {
      window.removeEventListener(WALLET_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  async function connect(walletId: string): Promise<WalletState> {
    const meta = WALLET_OPTIONS.find((w) => w.id === walletId);
    if (!meta) return { connected: false };

    if (walletId === "metamask" && typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = (await window.ethereum.request({
          method: "eth_requestAccounts",
        })) as string[];
        if (accounts && accounts[0]) {
          const s: WalletState = {
            connected: true,
            walletId,
            walletName: meta.name,
            address: accounts[0],
            real: true,
            balance: (Math.random() * 4 + 0.5).toFixed(4),
            network: meta.network,
            networkId: "ethereum",
            connectedAt: Date.now(),
          };
          saveWalletToStorage(s);
          setState(s);
          return s;
        }
      } catch {
        /* fall through to mock */
      }
    }

    await new Promise((r) => setTimeout(r, 700 + Math.random() * 400));
    const isSol = walletId === "phantom";
    const addr = isSol ? randomSolAddress() : randomEthAddress();
    const s: WalletState = {
      connected: true,
      walletId,
      walletName: meta.name,
      address: addr,
      real: false,
      balance: (Math.random() * 4 + 0.5).toFixed(4),
      network: meta.network,
      networkId: isSol ? "solana" : "ethereum",
      connectedAt: Date.now(),
    };
    saveWalletToStorage(s);
    setState(s);
    return s;
  }

  function disconnect() {
    const s: WalletState = { connected: false };
    saveWalletToStorage(s);
    setState(s);
  }

  function setNetwork(networkId: string) {
    if (!state.connected) return;
    const meta = FEATURED_NETWORKS.find((n) => n.id === networkId);
    const s: WalletState = {
      ...state,
      network: meta?.name || state.network,
      networkId,
    };
    saveWalletToStorage(s);
    setState(s);
  }

  return [state, { connect, disconnect, setNetwork }];
}

function randomEthAddress(): string {
  const chars = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 40; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}
function randomSolAddress(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
  let s = "";
  for (let i = 0; i < 44; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

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

// =====================================================================
// Avatar
// =====================================================================
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

// =====================================================================
// Modal — wallet chooser
// =====================================================================
function WalletModal({
  open,
  onClose,
  onConnect,
}: {
  open: boolean;
  onClose: () => void;
  onConnect: (walletId: string) => Promise<void>;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setPending(null);
      setError(null);
    }
  }, [open]);

  async function pick(w: WalletOption) {
    setError(null);
    setPending(w.id);
    try {
      await onConnect(w.id);
    } catch {
      setError("Could not connect to " + w.name + ". Try again.");
    } finally {
      setPending(null);
    }
  }

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
          zIndex: 110,
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connect a wallet"
        className="wallet-modal"
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: open
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.94)",
          width: "calc(100vw - 28px)",
          maxWidth: 480,
          maxHeight: "min(720px, calc(100vh - 32px))",
          background: "var(--bg-elev)",
          border: "1px solid var(--border-strong)",
          borderRadius: 28,
          boxShadow:
            "0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px var(--border) inset",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition:
            "opacity 0.22s ease, transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)",
          zIndex: 120,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px 22px 14px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 14,
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
              Step 1 of 2
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Connect a wallet
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: "var(--text-dim)",
                lineHeight: 1.45,
                maxWidth: 360,
              }}
            >
              Choose how you&rsquo;d like to sign in. Your wallet stays in your
              control — we never see your keys.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="focus-ring"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              width: 34,
              height: 34,
              borderRadius: "50%",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              color: "var(--text-dim)",
              flexShrink: 0,
              padding: 0,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11">
              <path
                d="M2 2 L9 9 M9 2 L2 9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div
          style={{
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          {WALLET_OPTIONS.map((w) => (
            <button
              key={w.id}
              disabled={!!pending}
              onClick={() => pick(w)}
              className="focus-ring"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 12px",
                background: "transparent",
                border:
                  "1px solid " +
                  (pending === w.id ? "var(--accent)" : "transparent"),
                borderRadius: 16,
                cursor: pending ? "progress" : "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                color: "var(--text)",
                opacity: pending && pending !== w.id ? 0.4 : 1,
                transition: "background 0.15s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!pending)
                  e.currentTarget.style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                if (!pending)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: w.bg,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 12px -4px rgba(0,0,0,0.4)",
                }}
              >
                {w.iconSvg ? (
                  w.iconSvg
                ) : (
                  <span
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {w.mark || w.name[0]}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {w.name}
                  </span>
                  {w.popular && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: "var(--accent)",
                        background: "var(--accent-soft)",
                        border: "1px solid rgba(78,254,154,0.25)",
                        padding: "1px 7px",
                        borderRadius: 999,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Popular
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-dim)",
                    marginTop: 2,
                  }}
                >
                  {w.desc} · {w.network}
                </div>
              </div>

              {pending === w.id ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "var(--accent)",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    style={{
                      animation: "spin 0.8s linear infinite",
                      transformOrigin: "center",
                    }}
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      fill="none"
                      strokeDasharray="22"
                      strokeDashoffset="11"
                      strokeLinecap="round"
                    />
                  </svg>
                  Connecting…
                </span>
              ) : (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  style={{ color: "var(--text-faint)" }}
                >
                  <path
                    d="M3.5 2 L7 5 L3.5 8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}

          {error && (
            <div
              style={{
                margin: "4px 0",
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(255,107,122,0.10)",
                border: "1px solid rgba(255,107,122,0.22)",
                color: "var(--neg)",
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div
          style={{
            padding: "14px 22px 18px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
            New to crypto?
          </span>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              fontSize: 12,
              color: "var(--text)",
              textDecoration: "underline",
              textDecorationColor: "var(--border-strong)",
              textUnderlineOffset: 3,
            }}
          >
            Learn about wallets →
          </a>
        </div>
      </div>
    </>
  );
}

// =====================================================================
// Details panel — shown when connected
// =====================================================================
function WalletDetails({
  state,
  actions,
  open,
  onClose,
  anchorRect,
}: {
  state: WalletState;
  actions: WalletActions;
  open: boolean;
  onClose: () => void;
  anchorRect: DOMRect | null;
}) {
  const [copied, setCopied] = useState(false);
  const [isSmall, setIsSmall] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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
    if (!state.connected) return;
    try {
      navigator.clipboard.writeText(state.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  if (!state.connected) return null;

  const meta = WALLET_OPTIONS.find((w) => w.id === state.walletId);
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
          <WalletAvatar address={state.address} size={44} />
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
                {shortAddress(state.address)}
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
            <div
              style={{
                fontSize: 11,
                color: "var(--text-dim)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 2,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 6,
                  background: meta?.bg,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {meta?.iconSvg && isValidElement(meta.iconSvg) ? (
                  cloneElement(meta.iconSvg, { width: 12, height: 12 })
                ) : (
                  <span
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 9,
                    }}
                  >
                    {meta?.mark || (state.walletName || "?")[0]}
                  </span>
                )}
              </div>
              {state.walletName}
              {state.real && (
                <span style={{ color: "var(--accent)", fontWeight: 500 }}>
                  · live
                </span>
              )}
            </div>
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
              {state.balance}
            </span>
            <span
              style={{
                fontSize: 14,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {state.networkId === "solana" ? "SOL" : "ETH"}
            </span>
            <span
              className="mono"
              style={{
                fontSize: 12,
                color: "var(--text-faint)",
                marginLeft: "auto",
              }}
            >
              ≈ $
              {(
                parseFloat(state.balance) *
                (state.networkId === "solana" ? 184 : 3845)
              ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
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
            {FEATURED_NETWORKS.map((n) => {
              const active = state.networkId === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => actions.setNetwork(n.id)}
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
                    cursor: "pointer",
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
                      background: n.color,
                    }}
                  />
                  {n.name}
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
            href="#"
            onClick={(e) => e.preventDefault()}
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
              actions.disconnect();
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
// Top-level button — renders connect or connected state
// =====================================================================
export function ConnectWalletButton({
  compact = false,
  fullWidth = false,
  className,
}: {
  compact?: boolean;
  fullWidth?: boolean;
  className?: string;
}): ReactNode {
  const [state, actions] = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  async function handleConnect(walletId: string) {
    await actions.connect(walletId);
    setModalOpen(false);
  }

  function openDetails() {
    if (triggerRef.current) {
      setAnchorRect(triggerRef.current.getBoundingClientRect());
    }
    setDetailsOpen(true);
  }

  if (!state.connected) {
    return (
      <>
        <button
          ref={triggerRef}
          onClick={() => setModalOpen(true)}
          className={"focus-ring" + (className ? " " + className : "")}
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
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
        <WalletModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConnect={handleConnect}
        />
      </>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={openDetails}
        className={"focus-ring" + (className ? " " + className : "")}
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
          transition: "border-color 0.15s ease, background 0.15s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--surface-2)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "var(--surface)")
        }
      >
        <WalletAvatar address={state.address} size={26} />
        {!compact && (
          <>
            <span className="mono" style={{ letterSpacing: "-0.005em" }}>
              {shortAddress(state.address)}
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
        state={state}
        actions={actions}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        anchorRect={anchorRect}
      />
    </>
  );
}
