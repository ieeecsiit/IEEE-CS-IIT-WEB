"use client";

import { animate, createTimeline, type JSAnimation, type Timeline } from "animejs";

type Running = JSAnimation | Timeline;
import { useEffect } from "react";
import { INTRO_KEY } from "../_lib/motion";

/** The overlay itself is plain HTML in the layout, so it is already covering the page when this loads. */
export function Intro() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("intro-active")) return;

    const overlay = document.getElementById("intro");
    const disc = document.getElementById("intro-disc");
    if (!overlay || !disc) {
      root.classList.remove("intro-active");
      return;
    }

    let cancelled = false;
    let finished = false;
    let flown = false;
    /** Everything currently animating, so it can be stopped or reverted together. */
    const running: Running[] = [];

    /** Tells the hero to start its own entrance, and brings the nav in. */
    const announceFlight = () => {
      if (flown) return;
      flown = true;
      root.classList.add("intro-fly");
      window.dispatchEvent(new Event("intro:fly"));
    };

    const finish = () => {
      if (finished || cancelled) return;
      finished = true;
      announceFlight();
      running.forEach((animation) => animation.pause());
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {
        // Private mode: the intro will simply play again next visit.
      }
      // One class change swaps the overlay for the hero's own disc, in the same frame.
      root.classList.remove("intro-active", "intro-fly");
      window.dispatchEvent(new Event("intro:end"));
    };

    /** Flies the disc onto the hero's disc: same centre, same size, same colour. */
    const fly = () => {
      if (cancelled || finished) return;
      const target = document.getElementById("hero-disc")?.getBoundingClientRect();
      if (!target || target.width === 0) {
        // No hero on this page: just dissolve.
        announceFlight();
        running.push(animate(overlay, { opacity: 0, duration: 800, ease: "inOutSine", onComplete: finish }));
        return;
      }

      announceFlight();
      const stage = overlay.getBoundingClientRect();
      const dx = target.left + target.width / 2 - (stage.left + stage.width / 2);
      const dy = target.top + target.height / 2 - (stage.top + stage.height / 2);

      running.push(
        animate(disc, {
          translateX: dx,
          translateY: dy,
          scale: target.width / disc.offsetWidth,
          backgroundColor: "#ffa300",
          duration: 1400,
          ease: "inOutQuart",
          onComplete: finish,
        }),
        // The orange wash lifts while the disc is travelling, so the page appears around it.
        animate(overlay, {
          backgroundColor: "rgba(255, 163, 0, 0)",
          duration: 1100,
          delay: 250,
          ease: "inOutSine",
        }),
      );
    };

    // Appear, zoom in, zoom out: a slow heartbeat, then the flight.
    const pulses = createTimeline({ onComplete: fly })
      .add(disc, { opacity: [0, 1], scale: [0.5, 1], duration: 900, ease: "outExpo" }, 0)
      .add(disc, { scale: 2.3, duration: 1200, ease: "inOutSine" }, 900)
      .add(disc, { scale: 0.8, duration: 1200, ease: "inOutSine" }, 2100);
    running.push(pulses);

    // Anyone in a hurry can skip it.
    const skip = (event: Event) => {
      if (event instanceof KeyboardEvent && !["Escape", "Enter", " "].includes(event.key)) return;
      finish();
    };
    overlay.addEventListener("click", skip);
    window.addEventListener("keydown", skip);
    // If anything goes wrong, never trap the visitor behind the overlay.
    const failsafe = window.setTimeout(finish, 9000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      overlay.removeEventListener("click", skip);
      window.removeEventListener("keydown", skip);
      running.forEach((animation) => animation.revert());
    };
  }, []);

  return null;
}
