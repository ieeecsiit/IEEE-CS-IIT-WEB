"use client";

import { useEffect, useRef } from "react";

/** Soft light that follows the cursor inside its parent section. Place it as the first child of a `relative`
 *  container. Purely decorative: ignored on touch devices and with reduced motion, never intercepts clicks. */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, active = false;

    const loop = () => {
      // Ease towards the pointer so the glow trails smoothly.
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!active) {
        active = true;
        x = tx;
        y = ty;
        el.style.opacity = "1";
      }
      kick();
    };
    const leave = () => {
      active = false;
      el.style.opacity = "0";

    };

    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        background:
          "radial-gradient(circle, rgb(255 255 255 / 0.55) 0%, rgb(255 236 190 / 0.3) 30%, rgb(255 255 255 / 0) 68%)",
      }}
      className="pointer-events-none absolute top-0 left-0 z-0 size-[560px] rounded-full opacity-0 mix-blend-soft-light transition-opacity duration-500 max-sm:size-[360px]"
    />
  );
}
