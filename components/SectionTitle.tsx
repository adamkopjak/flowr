export function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 13,
            color: "var(--text-dim)",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function SkeletonCard({ h = 200 }: { h?: number }) {
  return (
    <div
      className="card"
      style={{
        height: h,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div className="skeleton" style={{ height: 36, width: "50%" }} />
      <div className="skeleton" style={{ height: 24, width: "70%" }} />
      <div className="skeleton" style={{ flex: 1, marginTop: "auto" }} />
    </div>
  );
}
