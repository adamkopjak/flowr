export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className="card"
      style={{
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--text-faint)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
      <div
        className="mono"
        style={{
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: accent || "var(--text)",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{sub}</div>
      )}
    </div>
  );
}
