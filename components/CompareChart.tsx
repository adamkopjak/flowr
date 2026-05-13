"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fmtPrice } from "@/lib/format";

export type ChartSeries = {
  id: string;
  name: string;
  symbol: string;
  color: string;
  prices: number[];
};

export type RangeKey = "24h" | "3d" | "7d";

export function CompareChart({
  series,
  range,
  showGrid = true,
}: {
  series: ChartSeries[];
  range: RangeKey;
  showGrid?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  const [h, setH] = useState(360);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const padL = 14;
  const padR = 14;
  const padT = 12;
  const padB = 26;

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setW(Math.max(280, e.contentRect.width));
        if (e.contentRect.height > 20) setH(e.contentRect.height);
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const trimmed = useMemo(() => {
    const slice = range === "24h" ? -24 : range === "3d" ? -72 : -168;
    return series.map((s) => ({ ...s, prices: (s.prices || []).slice(slice) }));
  }, [series, range]);

  const norm = useMemo(() => {
    return trimmed.map((s) => {
      const base = s.prices[0] || 1;
      return {
        ...s,
        pct: s.prices.map((p) => (p / base - 1) * 100),
      };
    });
  }, [trimmed]);

  const { yLo, yHi, yRange } = useMemo(() => {
    const yMin = Math.min(
      0,
      ...norm.flatMap((s) => (s.pct.length ? [Math.min(...s.pct)] : [0])),
    );
    const yMax = Math.max(
      0,
      ...norm.flatMap((s) => (s.pct.length ? [Math.max(...s.pct)] : [0])),
    );
    const yPad = Math.max(0.5, (yMax - yMin) * 0.08);
    const lo = yMin - yPad;
    const hi = yMax + yPad;
    return { yLo: lo, yHi: hi, yRange: hi - lo || 1 };
  }, [norm]);

  const N = norm[0]?.pct.length || 0;
  const stepX = (w - padL - padR) / Math.max(1, N - 1);

  const toX = (i: number) => padL + i * stepX;
  const toY = (v: number) => padT + (h - padT - padB) * (1 - (v - yLo) / yRange);

  const paths = norm.map((s) => ({
    ...s,
    d: s.pct
      .map(
        (v, i) =>
          (i === 0 ? "M" : "L") + toX(i).toFixed(2) + "," + toY(v).toFixed(2),
      )
      .join(" "),
  }));

  const ySteps = 4;
  const gridLines: { y: number; label: string }[] = [];
  for (let i = 0; i <= ySteps; i++) {
    const v = yLo + (yRange * i) / ySteps;
    gridLines.push({
      y: toY(v),
      label: (v >= 0 ? "+" : "") + v.toFixed(1) + "%",
    });
  }

  const xTicks = N > 1 ? [0, Math.floor(N / 2), N - 1] : [];
  const tickLabel = (i: number) => {
    const stepsBack = N - 1 - i;
    if (range === "24h") {
      return stepsBack === 0 ? "now" : stepsBack + "h";
    }
    const hours = N - 1 - i;
    const days = (hours / 24).toFixed(0);
    return stepsBack === 0 ? "now" : days + "d ago";
  };

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const i = Math.round((x - padL) / stepX);
    if (i >= 0 && i < N) setHoverIdx(i);
  }

  const primaryFillId = "primaryFill";

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIdx(null)}
        style={{ display: "block", cursor: "crosshair" }}
      >
        <defs>
          <linearGradient id={primaryFillId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={series[0]?.color || "var(--accent)"}
              stopOpacity="0.28"
            />
            <stop
              offset="100%"
              stopColor={series[0]?.color || "var(--accent)"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {showGrid &&
          gridLines.map((g, i) => (
            <g key={i}>
              <line
                x1={padL}
                y1={g.y}
                x2={w - padR}
                y2={g.y}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="2,4"
              />
              <text
                x={w - padR}
                y={g.y - 4}
                fontSize="10"
                fill="var(--text-faint)"
                textAnchor="end"
                fontFamily="JetBrains Mono"
              >
                {g.label}
              </text>
            </g>
          ))}

        {yLo < 0 && yHi > 0 && (
          <line
            x1={padL}
            y1={toY(0)}
            x2={w - padR}
            y2={toY(0)}
            stroke="var(--border-strong)"
            strokeWidth="1"
          />
        )}

        {paths[0] && paths[0].pct.length > 1 && (
          <path
            d={
              paths[0].d +
              ` L ${w - padR},${h - padB} L ${padL},${h - padB} Z`
            }
            fill={`url(#${primaryFillId})`}
          />
        )}

        {paths.slice(1).map((p) => (
          <path
            key={p.id}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth="1.6"
            strokeOpacity="0.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {paths[0] && (
          <path
            d={paths[0].d}
            fill="none"
            stroke={paths[0].color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="spark-path"
          />
        )}

        {xTicks.map((i) => (
          <text
            key={i}
            x={toX(i)}
            y={h - 6}
            fontSize="10"
            fill="var(--text-faint)"
            textAnchor={i === 0 ? "start" : i === N - 1 ? "end" : "middle"}
            fontFamily="JetBrains Mono"
          >
            {tickLabel(i)}
          </text>
        ))}

        {hoverIdx != null && (
          <g>
            <line
              x1={toX(hoverIdx)}
              y1={padT}
              x2={toX(hoverIdx)}
              y2={h - padB}
              stroke="var(--text-dim)"
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity="0.5"
            />
            {paths.map((p) => {
              const v = p.pct[hoverIdx];
              if (v == null) return null;
              return (
                <circle
                  key={p.id}
                  cx={toX(hoverIdx)}
                  cy={toY(v)}
                  r="4"
                  fill="var(--bg)"
                  stroke={p.color}
                  strokeWidth="2"
                />
              );
            })}
          </g>
        )}
      </svg>

      {hoverIdx != null && (
        <div
          style={{
            left: Math.min(w - 200, Math.max(0, toX(hoverIdx) + 12)),
            top: 12,
            background: "var(--bg-elev)",
            border: "1px solid var(--border-strong)",
            borderRadius: 14,
            padding: "10px 12px",
            fontSize: 12,
            minWidth: 180,
            pointerEvents: "none",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--text-faint)",
              marginBottom: 6,
            }}
          >
            {tickLabel(hoverIdx)}
          </div>
          {paths.map((p) => {
            const v = p.pct[hoverIdx];
            const price = (p.prices || [])[hoverIdx];
            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "2px 0",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: p.color,
                    }}
                  />
                  <span
                    style={{
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontSize: 10,
                    }}
                  >
                    {p.symbol}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "baseline",
                  }}
                >
                  <span className="mono" style={{ color: "var(--text)" }}>
                    ${fmtPrice(price)}
                  </span>
                  <span
                    className="mono"
                    style={{
                      color: v >= 0 ? "var(--pos)" : "var(--neg)",
                      fontSize: 11,
                    }}
                  >
                    {(v >= 0 ? "+" : "") + (v ?? 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
