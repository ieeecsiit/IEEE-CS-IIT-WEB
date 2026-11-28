"use client";

import { animate, stagger, utils, type JSAnimation } from "animejs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../_lib/motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/merch", label: "Merch", soon: true },
];

const isActive = (href: string, pathname: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const highlight = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const highlightReady = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const panelAnimations = useRef<JSAnimation[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Slides the highlight under `href`, or hides it when there is no such link. */
  const moveHighlight = useCallback((href: string | undefined, instant = false) => {
    const mark = highlight.current;
    const target = href ? linkRefs.current[href] : null;
    if (!mark) return;
    if (!target) {
      animate(mark, { opacity: 0, duration: 250, ease: "outQuad" });
      return;
    }
    const params = { translateX: target.offsetLeft, width: target.offsetWidth, opacity: 1 };
    if (instant || prefersReducedMotion()) utils.set(mark, params);
    else animate(mark, { ...params, duration: 650, ease: "outExpo" });
  }, []);

  const activeHref = links.find(({ href }) => isActive(href, pathname))?.href;

  // Rest the highlight under the current page (no animation on first paint, a glide afterwards).
  useLayoutEffect(() => {
    moveHighlight(activeHref, !highlightReady.current);
    highlightReady.current = true;
    const onResize = () => moveHighlight(activeHref, true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeHref, moveHighlight]);

  // Mobile menu: a clip-path wipe, then the links rise in one by one.
  useEffect(() => {
    const element = panel.current;
    if (!element) return;
    panelAnimations.current.forEach((animation) => animation.revert());
    panelAnimations.current = [];

    if (menuOpen) {
      document.documentElement.style.overflow = "hidden";
      element.style.visibility = "visible";
      panelAnimations.current.push(
        animate(element, { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"], duration: 800, ease: "outExpo" }),
        animate(element.querySelectorAll("[data-menu-item]"), {
          opacity: [0, 1],
          translateY: [36, 0],
          duration: 900,
          ease: "outExpo",
          delay: stagger(70, { start: 250 }),
        }),
      );
    } else if (element.style.visibility === "visible") {
      document.documentElement.style.overflow = "";
      panelAnimations.current.push(
        animate(element, {
          clipPath: ["inset(0 0 0% 0)", "inset(0 0 100% 0)"],
          duration: 550,
          ease: "inOutQuart",
          onComplete: () => {
            element.style.visibility = "hidden";
          },
        }),
      );
    }
  }, [menuOpen]);

  // Never leave the page scroll-locked, and let Escape close the menu.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="site-nav pointer-events-none fixed inset-x-0 top-4 z-[9999] flex justify-center px-3">
        <div
          className={`pointer-events-auto flex items-center gap-1 rounded-full bg-ink/90 p-1.5 pl-2 text-white ring-1 ring-white/10 backdrop-blur-md transition-shadow duration-500 max-md:w-full max-md:max-w-[460px] max-md:justify-between ${
            scrolled ? "shadow-[0_12px_40px_-8px_rgba(0,0,0,0.45)]" : "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)]"
          }`}
        >
          <Link href="/" onClick={closeMenu} aria-label="IEEE CS IIT, home" className="flex items-center gap-2.5 rounded-full pr-3">
            <span className="logo-mark size-9 bg-brand" />
            <span className="text-[17px] leading-none font-semibold tracking-tight">IEEE CS</span>
          </Link>

          <nav
            aria-label="Main"
            onPointerLeave={() => moveHighlight(activeHref)}
            className="relative ml-1 hidden items-center md:flex"
          >
            <span
              ref={highlight}
              aria-hidden
              className="absolute top-0 left-0 h-full rounded-full bg-white/12 opacity-0"
            />
            {links.map(({ href, label, soon }) => {
              const active = isActive(href, pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  ref={(element) => {
                    linkRefs.current[href] = element;
                  }}
                  onPointerEnter={() => moveHighlight(href)}
                  onFocus={() => moveHighlight(href)}
                  onBlur={() => moveHighlight(activeHref)}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[16px] leading-none font-normal transition-colors duration-300 ${
                    active ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {label}
                  {soon && <span className="size-1.5 rounded-full bg-brand" title="Coming soon" />}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/#join"
            className="ml-2 hidden rounded-full bg-brand px-5 py-2.5 text-[16px] leading-none font-medium text-ink transition-colors duration-300 hover:bg-white md:block"
          >
            Join us
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="relative size-9 cursor-pointer rounded-full bg-white/10 transition-colors duration-300 hover:bg-white/20 md:hidden"
          >
            <span
              className={`absolute top-1/2 left-1/2 h-[1.5px] w-4 -translate-x-1/2 bg-white transition-transform duration-500 ease-out-quart ${
                menuOpen ? "rotate-45" : "-translate-y-[3.5px]"
              }`}
            />
            <span
              className={`absolute top-1/2 left-1/2 h-[1.5px] w-4 -translate-x-1/2 bg-white transition-transform duration-500 ease-out-quart ${
                menuOpen ? "-rotate-45" : "translate-y-[2px]"
              }`}
            />
          </button>
        </div>
      </header>

      {/* Full-screen menu for small screens. */}
      <div
        ref={panel}
        id="mobile-menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        style={{ visibility: "hidden" }}
        className="fixed inset-0 z-[9998] flex flex-col justify-center overflow-hidden bg-ink px-8 pt-24 pb-10 text-white md:hidden"
      >
        <div aria-hidden className="logo-mark pointer-events-none absolute -right-[30%] -bottom-[8%] w-[90%] bg-white/[0.04]" />
        <nav aria-label="Mobile" className="relative flex flex-col gap-1">
          {links.map(({ href, label, soon }) => (
            <Link
              key={href}
              href={href}
              data-menu-item
              onClick={closeMenu}
              aria-current={isActive(href, pathname) ? "page" : undefined}
              className={`flex items-center gap-3 py-2 text-[clamp(2.6rem,12vw,4rem)] leading-[1.05] font-extralight tracking-[-0.03em] ${
                isActive(href, pathname) ? "text-brand" : "text-white"
              }`}
            >
              {label}
              {soon && (
                <span className="rounded-full bg-brand px-3 py-1.5 text-sm leading-none font-medium tracking-normal text-ink">
                  Soon
                </span>
              )}
            </Link>
          ))}
        </nav>
        <Link
          href="/#join"
          data-menu-item
          onClick={closeMenu}
          className="relative mt-10 self-start rounded-full bg-brand px-8 py-4 text-lg leading-none font-medium text-ink"
        >
          Join us
        </Link>
      </div>

      {/* Inner pages start below the floating nav; the home hero runs underneath it. */}
      {pathname !== "/" && <div aria-hidden className="h-[84px]" />}
    </>
  );
}
