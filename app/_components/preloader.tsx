"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MIN_MS = 1800;

/** Simple fullscreen intro: the hero logo centred on the hero background with a thin progress line.
 *  Server-rendered visible so there is no flash of content; <noscript> CSS hides it without JS.
 *  Scroll is locked by CSS (`body:has(#preloader:not([data-leaving]))` in globals.css). */
export function Preloader() {
  const [phase, setPhase] = useState<"show" | "leaving" | "gone">("show");
  const [progress, setProgress] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Sit exactly on top of the hero logo (measured), so the handoff cannot jump regardless of scrollbar,
  // mobile browser toolbars or viewport units. Pages without a hero logo get a plain centred logo.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const logo = logoRef.current;
    if (!root || !logo) return;
    const apply = () => {
      // `html { scrollbar-gutter: stable }` keeps page width constant; match the overlay to that area.
      root.style.right = `${Math.max(0, window.innerWidth - document.documentElement.clientWidth)}px`;
      const hero = document.querySelector("[data-hero-logo]");
      const r = hero?.getBoundingClientRect();
      if (r && r.width > 0 && r.bottom > 0 && r.top < window.innerHeight) {
        logo.style.left = `${r.left + r.width / 2}px`;
        logo.style.top = `${r.top + r.height / 2}px`;
        logo.style.width = `${r.width}px`;
      } else {
        logo.style.left = "50%";
        logo.style.top = "50%";
        logo.style.width = "";
      }
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useEffect(() => {
    const start = performance.now();
    let loaded = document.readyState === "complete";
    let raf = 0;
    let finished = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const onLoad = () => (loaded = true);
    if (!loaded) window.addEventListener("load", onLoad, { once: true });
    // Never let a slow asset trap the visitor.
    timers.push(setTimeout(onLoad, 4500));

    const tick = (now: number) => {
      const t = Math.min((now - start) / MIN_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      // Hold at 92% until the page has really loaded, then run to 100.
      const value = Math.round((loaded ? eased : Math.min(eased, 0.92)) * 100);
      setProgress(value);
      if (value >= 100 && !finished) {
        finished = true;
        timers.push(
          setTimeout(() => {
            // Lets the hero start its entrance animation (see `.hero-rise` in globals.css).
            document.documentElement.dataset.ready = "1";
            setPhase("leaving");
            timers.push(setTimeout(() => setPhase("gone"), 1100));
          }, 250),
        );
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (phase === "gone") return null;
  const leaving = phase === "leaving";

  return (
    <div
      id="preloader"
      ref={rootRef}
      role="status"
      aria-label="Loading"
      data-leaving={leaving ? "" : undefined}
      style={{
        opacity: leaving ? 0 : 1,
        pointerEvents: leaving ? "none" : "auto",
      }}
      className="fixed inset-y-0 left-0 right-0 z-[10000] bg-radial from-brand to-white text-ink [--logo:400px] max-md:[--logo:250px] max-sm:[--logo:200px] max-xs:[--logo:150px] transition-opacity duration-700 ease-out"
    >
      {/* Positioned over the hero logo by the layout effect above; centred by default */}
      <div
        ref={logoRef}
        className="absolute top-1/2 left-1/2 w-(--logo) -translate-x-1/2 -translate-y-1/2"
      >
        <Image
          src="/images/ieee-cs-sbc-of-iit-white.webp"
          alt=""
          width={1566}
          height={702}
          priority
          sizes="400px"
          className="preloader-logo h-auto w-full select-none"
        />
        <div
          aria-hidden
          className="absolute top-full left-1/2 mt-7 h-[3px] w-[160px] -translate-x-1/2 overflow-hidden rounded-full bg-ink/15"
        >
          <div className="h-full rounded-full bg-ink" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
