"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  YAxis,
} from "recharts";

export function Sparkline({
  data,
  height = 56,
  positive = true,
  fill = true,
}: {
  data: number[] | undefined;
  height?: number;
  positive?: boolean;
  fill?: boolean;
}) {
  const uid = useId().replace(/:/g, "");

  if (!data || data.length < 2) {
    return <div className="skeleton" style={{ width: "100%", height }} />;
  }

  const chartData = data.map((value, i) => ({ i, value }));
  const color = positive ? "var(--pos)" : "var(--neg)";
  const gradId = `spark-${uid}`;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 2, right: 0, left: 0, bottom: 2 }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={fill ? `url(#${gradId})` : "transparent"}
            isAnimationActive
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
