"use client";

import { useEffect, useRef, useState } from "react";

/** Counts up to `value` (e.g. "500+") the first time it scrolls into view. Renders the final value on the server. */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const match = /^(\d+)(.*)$/.exec(value);
  const end = match ? Number(match[1]) : 0;
  const suffix = match?.[2] ?? "";
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(end);

  useEffect(() => {
    const el = ref.current;
    if (!el || !match || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          setN(Math.round(end * (1 - Math.pow(1 - t, 4))));
          if (t < 1) raf = requestAnimationFrame(step);
        };
        setN(0);
        raf = requestAnimationFrame(step);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}
