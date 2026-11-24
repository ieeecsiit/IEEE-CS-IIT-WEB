"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "./container";
import { SiteImage } from "./site-image";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/events", label: "Our Events" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const menuOpenRef = useRef(false);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  // Hide while scrolling down, reveal while scrolling up; drive the reading-progress bar without re-rendering.
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current?.style.setProperty("transform", `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`);
      setScrolled(y > 30);
      setHidden(y > lastScrollY && y > 150 && !menuOpenRef.current);
      lastScrollY = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 z-[9999] w-full transition-transform duration-500 ease-out-quart ${
          hidden ? "-translate-y-full" : ""
        }`}
      >
        <div className={`transition-[padding] duration-500 ease-out-quart ${scrolled ? "pt-2" : "pt-4"}`}>
          <Container>
            <div
              className={`relative flex items-center justify-between rounded-2xl border border-white/10 transition-[padding,background-color,box-shadow] duration-500 ease-out-quart ${
                scrolled
                  ? "bg-ink/85 px-5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl"
                  : "bg-ink px-6 py-4 shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
              }`}
            >
              <Link href="/" aria-label="Home" className="flex-none">
                <SiteImage
                  src="/images/ieee-cs-sbc-of-iit-yellow-white.webp"
                  alt="IEEECS"
                  priority
                  sizes="170px"
                  className="w-[170px] max-sm:w-[140px] max-xs:w-[120px]"
                />
              </Link>

              <nav
                aria-label="Main"
                className={`ml-auto flex items-center gap-1 self-center max-md:absolute max-md:top-[calc(100%+8px)] max-md:right-0 max-md:left-0 max-md:origin-top max-md:flex-col max-md:items-stretch max-md:gap-0 max-md:overflow-hidden max-md:rounded-2xl max-md:border max-md:border-white/10 max-md:bg-ink/95 max-md:p-3 max-md:shadow-[0_20px_40px_rgba(0,0,0,0.3)] max-md:backdrop-blur-xl max-md:transition-[opacity,transform,visibility] max-md:duration-300 max-md:ease-out-quart ${
                  menuOpen
                    ? "max-md:visible max-md:scale-100 max-md:opacity-100"
                    : "max-md:invisible max-md:scale-95 max-md:opacity-0"
                }`}
              >
                {links.map(({ href, label }, i) => {
                  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      style={{ transitionDelay: menuOpen ? `${i * 40}ms` : "0ms" }}
                      className={`group relative rounded-lg px-4 py-2 text-[16px] font-normal tracking-wide uppercase transition-[color,background-color,opacity,transform] duration-300 hover:text-brand xl:text-[17px] max-md:py-3.5 max-md:text-center max-md:hover:bg-white/5 ${
                        menuOpen ? "max-md:translate-y-0 max-md:opacity-100" : "max-md:translate-y-2 max-md:opacity-0"
                      } ${active ? "text-brand" : "text-white"}`}
                    >
                      {label}
                      <span
                        aria-hidden
                        className={`absolute right-4 bottom-1 left-4 h-0.5 origin-left rounded-full bg-brand transition-transform duration-300 ease-out-quart max-md:hidden ${
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  );
                })}
              </nav>

              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="order-1 ml-5 hidden size-11 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition-colors hover:border-brand hover:text-brand max-md:flex max-sm:ml-2.5"
              >
                <span className="relative block h-4 w-5">
                  <span
                    className={`absolute left-0 block h-0.5 w-5 rounded bg-current transition-all duration-300 ${
                      menuOpen ? "top-[7px] rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`absolute top-[7px] left-0 block h-0.5 w-5 rounded bg-current transition-all duration-300 ${
                      menuOpen ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`absolute left-0 block h-0.5 w-5 rounded bg-current transition-all duration-300 ${
                      menuOpen ? "top-[7px] -rotate-45" : "top-[14px]"
                    }`}
                  />
                </span>
              </button>

              {/* Reading progress, clipped to the bar's rounded corners. */}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] overflow-hidden rounded-b-2xl">
                <div ref={progressRef} className="h-full origin-left scale-x-0 bg-brand" />
              </div>
            </div>
          </Container>
        </div>
      </header>
      {/* Spacer matching the unscrolled header: 16px top + 2px border + 32px padding + logo height (1566x702). */}
      <div
        aria-hidden
        className="h-[calc(50px+170px*702/1566)] max-sm:h-[calc(50px+140px*702/1566)] max-xs:h-[calc(50px+120px*702/1566)]"
      />
    </>
  );
}
