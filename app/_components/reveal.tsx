"use client";

import { animate, type AnimationParams, type JSAnimation } from "animejs";
import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { prefersReducedMotion } from "../_lib/motion";

/** Where each variant starts from. All of them end at the element's natural position. */
const variants: Record<string, AnimationParams> = {
  left: { translateX: [-40, 0], opacity: [0, 1] },
  right: { translateX: [40, 0], opacity: [0, 1] },
  bottom: { translateY: [48, 0], opacity: [0, 1] },
  fade: { opacity: [0, 1] },
  /** A hairline that draws itself from the left. */
  rule: { scaleX: [0, 1], opacity: [1, 1] },
  /** Images that open from the top down. */
  grow: { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"], opacity: [1, 1] },
};

type RevealProps = {
  children?: ReactNode;
  from: "left" | "right" | "bottom" | "fade" | "rule" | "grow";
  as?: ElementType;
  className?: string;
  /** Milliseconds to wait once the element is in view. Use it to stagger siblings. */
  delay?: number;
};

/** Animates its content in, once, the first time it scrolls into view. */
export function Reveal({ children, from, as: Tag = "div", className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (prefersReducedMotion()) {
      element.dataset.reveal = "done";
      return;
    }

    let animation: JSAnimation | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        element.dataset.reveal = "running";
        animation = animate(element, {
          ...variants[from],
          delay,
          duration: from === "rule" ? 1400 : 1100,
          ease: "outExpo",
          onComplete: () => {
            element.dataset.reveal = "done";
          },
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      animation?.revert();
    };
  }, [from, delay]);

  return (
    <Tag ref={ref} data-reveal="pending" className={`${from === "rule" ? "origin-left" : ""} ${className}`}>
      {children}
    </Tag>
  );
}
