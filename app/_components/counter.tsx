"use client";

import { animate, type JSAnimation } from "animejs";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../_lib/motion";

type CounterProps = { to: number; suffix?: string; className?: string };

const format = (value: number) => Math.round(value).toLocaleString("en-US");

/** Counts up to `to` when scrolled into view. The final number is in the server HTML. */
export function Counter({ to, suffix = "", className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;

    const state = { value: 0 };
    let animation: JSAnimation | undefined;
    element.textContent = format(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        animation = animate(state, {
          value: to,
          duration: 2200,
          ease: "outExpo",
          onUpdate: () => {
            element.textContent = format(state.value);
          },
        });
      },
      { threshold: 0.6 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      animation?.revert();
      element.textContent = format(to);
    };
  }, [to]);

  return (
    <span className={className}>
      <span ref={ref}>{format(to)}</span>
      {suffix}
    </span>
  );
}
