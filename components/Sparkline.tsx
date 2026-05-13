"use client";

import { useId } from "react";

export function Sparkline({
  data,
  height = 56,
  positive = true,
  fill = true,
  animate = true,
}: {
  data: number[] | undefined;
  height?: number;
  positive?: boolean;
  fill?: boolean;
  animate?: boolean;
}) {
  const uid = useId().replace(/:/g, "");

  if (!data || data.length < 2) {
    return <div className="skeleton" style={{ width: "100%", height }} />;
  }

  const width = 300;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padY = 2;
  const stepX = width / (data.length - 1);
  const toY = (v: number) =>
    padY + (height - padY * 2) * (1 - (v - min) / range);
  const d = data
    .map(
      (v, i) =>
        (i === 0 ? "M" : "L") + (i * stepX).toFixed(2) + "," + toY(v).toFixed(2),
    )
    .join(" ");
  const areaD = d + ` L ${width},${height} L 0,${height} Z`;
  const color = positive ? "var(--pos)" : "var(--neg)";
  const gid = "spark-" + uid;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={areaD} fill={`url(#${gid})`} />}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? "spark-path" : ""}
      />
    </svg>
  );
}
