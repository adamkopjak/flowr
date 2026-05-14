"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type PortfolioRangeKey = "24h" | "3d" | "7d" | "30d" | "1y" | "all";

function fmtUSD(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function PortfolioChart({
  series,
  range,
  showGrid = true,
  accent,
}: {
  series: number[];
  range: PortfolioRangeKey;
  showGrid?: boolean;
  accent?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  const [h, setH] = useState(360);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const padL = 14;
  const padR = 14;
  const padT = 14;
  const padB = 28;

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

  const points = useMemo(() => {
    if (!series || series.length === 0) return [] as number[];
    if (range === "24h") return series.slice(-24);
    if (range === "3d") return series.slice(-72);
    if (range === "7d") return series.slice(-168);

    const target = range === "30d" ? 120 : range === "1y" ? 365 : 730;
    const base = series;
    const out: number[] = [];
    const step = base.length / target;
    const last = base[base.length - 1] || 0;
    for (let i = 0; i < target; i++) {
      const srcIdx = Math.min(base.length - 1, Math.floor(i * step));
      const phaseDrift = (1 - i / target) * 0.45;
      const wobble =
        Math.sin(i * 0.18) * 0.04 + Math.sin(i * 0.07) * 0.06;
      out.push(base[srcIdx] * (1 - phaseDrift + wobble));
    }
    out[out.length - 1] = last;
    return out;
  }, [series, range]);

  const N = points.length;
  const yMin = N ? Math.min(...points) : 0;
  const yMax = N ? Math.max(...points) : 1;
  const yPadVal = Math.max((yMax - yMin) * 0.08, yMax * 0.01);
  const yLo = Math.max(0, yMin - yPadVal);
  const yHi = yMax + yPadVal;
  const yRange = yHi - yLo || 1;
  const stepX = (w - padL - padR) / Math.max(1, N - 1);
  const toX = (i: number) => padL + i * stepX;
  const toY = (v: number) =>
    padT + (h - padT - padB) * (1 - (v - yLo) / yRange);

  const d = points
    .map(
      (v, i) =>
        (i === 0 ? "M" : "L") + toX(i).toFixed(2) + "," + toY(v).toFixed(2),
    )
    .join(" ");
  const areaD = d + ` L ${w - padR},${h - padB} L ${padL},${h - padB} Z`;

  const color = accent || "var(--accent)";

  const ySteps = 4;
  const gridLines: { y: number; label: string }[] = [];
  for (let i = 0; i <= ySteps; i++) {
    const v = yLo + (yRange * i) / ySteps;
    gridLines.push({
      y: toY(v),
      label:
        "$" + (v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)),
    });
  }

  const xTicks =
    N > 1
      ? [0, Math.floor(N / 4), Math.floor(N / 2), Math.floor((3 * N) / 4), N - 1]
      : [];
  const tickLabel = (i: number) => {
    if (i === N - 1) return "now";
    const stepsBack = N - 1 - i;
    if (range === "24h") return stepsBack + "h";
    if (range === "3d") return Math.round(stepsBack / 24) + "d";
    if (range === "7d") return Math.round(stepsBack / 24) + "d";
    if (range === "30d") return Math.round((stepsBack / N) * 30) + "d";
    if (range === "1y") return Math.round((stepsBack / N) * 12) + "mo";
    return Math.round((stepsBack / N) * 24) + "mo";
  };

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const i = Math.round((x - padL) / stepX);
    if (i >= 0 && i < N) setHoverIdx(i);
  }

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
          <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.30" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
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

        {N > 1 && <path d={areaD} fill="url(#portfolioFill)" />}
        {N > 1 && (
          <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="spark-path"
            key={range + N}
          />
        )}

        {xTicks.map((i) => (
          <text
            key={i}
            x={toX(i)}
            y={h - 8}
            fontSize="10"
            fill="var(--text-faint)"
            textAnchor={i === 0 ? "start" : i === N - 1 ? "end" : "middle"}
            fontFamily="JetBrains Mono"
          >
            {tickLabel(i)}
          </text>
        ))}

        {hoverIdx != null && N > 0 && (
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
            <circle
              cx={toX(hoverIdx)}
              cy={toY(points[hoverIdx])}
              r="5"
              fill="var(--bg)"
              stroke={color}
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {hoverIdx != null && N > 0 && (
        <div
          style={{
            position: "absolute",
            left: Math.min(w - 170, Math.max(0, toX(hoverIdx) + 14)),
            top: 16,
            background: "var(--bg-elev)",
            border: "1px solid var(--border-strong)",
            borderRadius: 14,
            padding: "8px 12px",
            fontSize: 12,
            minWidth: 140,
            pointerEvents: "none",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--text-faint)",
              marginBottom: 4,
            }}
          >
            {tickLabel(hoverIdx)}
          </div>
          <div className="mono" style={{ fontSize: 15, fontWeight: 500 }}>
            {fmtUSD(points[hoverIdx])}
          </div>
        </div>
      )}
    </div>
  );
}
