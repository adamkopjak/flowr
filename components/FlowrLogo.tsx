export function FlowrLogo({ size = 30 }: { size?: number }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.32,
          background: "var(--accent)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.04), 0 8px 20px -6px var(--accent-glow)",
          display: "grid",
          placeItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={size * 0.62}
          height={size * 0.62}
          fill="none"
        >
          <path
            d="M4 8 C 8 8, 8 16, 12 16"
            stroke="#04140A"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M9 8 C 13 8, 13 16, 17 16"
            stroke="#04140A"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M14 8 C 18 8, 18 16, 22 16"
            stroke="#04140A"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.25"
          />
        </svg>
      </div>
      <div className="flex items-baseline">
        <span
          style={{
            fontSize: size * 0.78,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            color: "var(--text)",
            lineHeight: 1,
          }}
        >
          flowr
        </span>
        <span
          style={{
            fontSize: size * 0.78,
            fontWeight: 600,
            color: "var(--accent)",
            lineHeight: 1,
          }}
        >
          .
        </span>
      </div>
    </div>
  );
}
