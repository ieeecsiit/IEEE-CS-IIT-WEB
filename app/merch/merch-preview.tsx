"use client";

import { animate, stagger, type JSAnimation } from "animejs";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../_lib/motion";

/** Placeholder shelf for the store. Swap these for real products when the store opens. */
const shelf = [
  { name: "Tees", art: <path d="M35 14 12 26l8 18 10-5v50h40V39l10 5 8-18-23-12c-3 8-27 8-30 0Z" /> },
  {
    name: "Hoodies",
    art: (
      <>
        <path d="M38 14 16 25l-8 28 12 4 4-12v46h52V45l4 12 12-4-8-28-22-11c-2 10-22 10-24 0Z" />
        <path d="M36 70h28v14H36Z" />
      </>
    ),
  },
  { name: "Stickers", art: <circle cx="50" cy="50" r="30" /> },
];

export function MerchPreview() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || prefersReducedMotion()) return;
    // Each card settles from a slightly different tilt.
    const animations: JSAnimation[] = Array.from(element.querySelectorAll("[data-card]")).map((card, index) =>
      animate(card, {
        opacity: [0, 1],
        translateY: [60, 0],
        rotate: [(index - 1) * 7, 0],
        duration: 1400,
        ease: "outExpo",
        delay: 300 + index * 140,
      }),
    );
    // After they've arrived, the cards drift gently, out of step with each other.
    const drift = window.setTimeout(() => {
      animations.push(
        animate(element.querySelectorAll("[data-float]"), {
          translateY: [0, -10],
          duration: 2600,
          ease: "inOutSine",
          loop: true,
          alternate: true,
          delay: stagger(450),
        }),
      );
    }, 2000);
    return () => {
      window.clearTimeout(drift);
      animations.forEach((animation) => animation.revert());
    };
  }, []);

  return (
    <div ref={root} className="grid grid-cols-3 gap-4 max-sm:gap-3">
      {shelf.map(({ name, art }, index) => (
        <div key={name} data-card style={{ marginTop: index === 1 ? "2.5rem" : 0 }}>
          <div data-float className="relative aspect-3/4 overflow-hidden rounded-[18px] border border-line bg-white">
            <div className="shimmer absolute inset-0 overflow-hidden" aria-hidden />
            <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-[18%] size-[64%] fill-brand/15 stroke-brand" strokeWidth="1.6" strokeLinejoin="round">
              {art}
            </svg>
            <span className="absolute top-3 left-3 rounded-full bg-ink px-3 py-1.5 text-sm leading-none text-white">Soon</span>
          </div>
          <p className="mt-3 mb-0 text-lg leading-none font-light text-ink/70">{name}</p>
        </div>
      ))}
    </div>
  );
}
