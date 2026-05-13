"use client";

import { useEffect, useRef, useState } from "react";

export function AnimNum({
  value,
  format,
}: {
  value: number;
  format: (n: number) => string;
}) {
  const prev = useRef(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const dur = 700;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span>{format(display)}</span>;
}
