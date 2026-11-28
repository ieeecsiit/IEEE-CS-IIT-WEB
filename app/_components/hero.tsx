"use client";

import { animate, createAnimatable, stagger, type JSAnimation } from "animejs";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { MEMBER_FORM_URL } from "../_lib/links";
import { prefersReducedMotion } from "../_lib/motion";

const motto = [
  { word: "Innovate", weight: "font-extralight" },
  { word: "Automate", weight: "font-semibold" },
  { word: "Dominate", weight: "font-extralight" },
] as const;


export function Hero() {
  const root = useRef<HTMLElement>(null);
  const parallax = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = root.current;
    const wrap = parallax.current;
    const mark = disc.current;
    if (!section || !wrap || !mark) return;

    if (prefersReducedMotion()) {
      section.dataset.static = "true";
      return;
    }

    const animations: JSAnimation[] = [];
    const undo: (() => void)[] = [];
    let started = false;

    /** Headline, copy and buttons. Starts as the intro's disc begins its flight. */
    const enter = () => {
      if (started) return;
      started = true;
      animations.push(
        animate(section.querySelectorAll(".hero-line"), {
          translateY: ["105%", "0%"],
          duration: 1300,
          ease: "outExpo",
          delay: stagger(120, { start: 150 }),
        }),
        animate(section.querySelectorAll("[data-hero-fade]"), {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 1100,
          ease: "outExpo",
          delay: stagger(110, { start: 650 }),
        }),
      );
    };

    /** The disc has landed: ripples spread out, then everything starts to breathe. */
    const settle = () => {
      animations.push(
        animate(section.querySelectorAll("[data-ring]"), {
          opacity: [0, 1],
          scale: [0.7, 1],
          duration: 1400,
          ease: "outExpo",
          delay: stagger(160),
        }),
        // One slow breath, shared by the disc and its rings (rings trail by a beat).
        animate(mark, { scale: [1, 1.045], duration: 3600, ease: "inOutSine", loop: true, alternate: true }),
        animate(section.querySelectorAll("[data-ring]"), {
          scale: [1, 1.05],
          duration: 3600,
          ease: "inOutSine",
          loop: true,
          alternate: true,
          delay: stagger(260, { start: 1400 }),
        }),
      );

      // The disc follows the pointer a little. Skipped on touch screens.
      if (window.matchMedia("(hover: hover)").matches) {
        const follow = createAnimatable(wrap, { x: 900, y: 900, ease: "out(3)" });
        const onMove = (event: PointerEvent) => {
          const rect = section.getBoundingClientRect();
          follow.x(((event.clientX - rect.left) / rect.width - 0.5) * -34);
          follow.y(((event.clientY - rect.top) / rect.height - 0.5) * -34);
        };
        section.addEventListener("pointermove", onMove);
        undo.push(() => {
          section.removeEventListener("pointermove", onMove);
          follow.revert();
        });
      }
    };

    if (document.documentElement.classList.contains("intro-active")) {
      window.addEventListener("intro:fly", enter, { once: true });
      window.addEventListener("intro:end", settle, { once: true });
      undo.push(() => {
        window.removeEventListener("intro:fly", enter);
        window.removeEventListener("intro:end", settle);
      });
    } else {
      // No intro (returning visitor, other page): the disc simply arrives.
      animations.push(
        animate(mark, { opacity: [0, 1], scale: [0.85, 1], duration: 1500, ease: "outExpo" }),
      );
      enter();
      const timer = window.setTimeout(settle, 1500);
      undo.push(() => window.clearTimeout(timer));
    }

    return () => {
      undo.forEach((fn) => fn());
      animations.forEach((animation) => animation.revert());
    };
  }, []);

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-svh items-center overflow-hidden pt-28 pb-16 max-md:pt-32"
    >
      <div aria-hidden className="hero-glow absolute inset-0 -z-10" />

      <div className="mx-auto grid w-full max-w-full grid-cols-[1.1fr_1fr] items-center gap-x-6 gap-y-14 px-5 xl:max-w-[1440px] 2xl:max-w-[1740px] max-md:grid-cols-1">
        <div className="relative z-10 max-md:order-2">
          <h1 className="sr-only">IEEE Computer Society Student Branch Chapter of IIT</h1>
          <p
            aria-label="Innovate. Automate. Dominate."
            className="m-0 text-[clamp(3.4rem,9vw,8.75rem)] leading-[0.95] tracking-[-0.04em] text-ink"
          >
            {motto.map(({ word, weight }) => (
              // The wrapper clips each word while it rises into place; the padding keeps descenders from being cut.
              <span key={word} aria-hidden className="block overflow-hidden pb-[0.08em]">
                <span className={`hero-line block ${weight}`}>
                  {word}
                  <span className="font-semibold text-brand">.</span>
                </span>
              </span>
            ))}
          </p>

          <p data-hero-fade className="mt-9 mb-0 max-w-[34ch] text-[clamp(1.1rem,1.6vw,1.4rem)] leading-snug font-light text-ink/75">
            The IEEE Computer Society student chapter at the Informatics Institute of Technology. Hackathons,
            contests and workshops, since 2017.
          </p>

          <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href={MEMBER_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-ink px-7 py-4 text-lg leading-none font-medium text-white transition-colors duration-300 hover:bg-brand hover:text-ink"
            >
              Join as a member
            </a>
            <Link
              href="/events"
              className="text-lg leading-none font-medium text-ink underline decoration-brand decoration-2 underline-offset-[10px] transition-colors duration-300 hover:text-ember"
            >
              See what we&apos;ve built
            </Link>
          </div>
        </div>

        {/* The disc sits in a square cell so the intro has an exact spot to land on. */}
        <div ref={parallax} className="relative mx-auto aspect-square w-full max-w-[620px] justify-self-end max-md:order-1 max-md:max-w-[min(70vw,380px)]">
          {[-10, -24, -40].map((inset) => (
            <div
              key={inset}
              data-ring
              aria-hidden
              style={{ inset: `${inset}%`, opacity: 0 }}
              className="absolute rounded-full border border-brand/45"
            />
          ))}
          <div ref={disc} id="hero-disc" aria-hidden className="logo-mark absolute inset-0 bg-brand" />
        </div>
      </div>

      <div
        data-hero-fade
        aria-hidden
        className="absolute bottom-6 left-1/2 hidden h-10 w-6 -translate-x-1/2 justify-center rounded-full border border-ink/30 pt-2 md:flex"
      >
        <span className="block size-1.5 animate-bounce rounded-full bg-ink/60" />
      </div>
    </section>
  );
}
