"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  // Hide while scrolling down, reveal while scrolling up.
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      setHidden(currentScrollY > lastScrollY && currentScrollY > 150);
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 z-[9999] w-full transition-[translate,background-color,box-shadow] duration-300 ease-in-out ${
          hidden ? "-translate-y-full" : ""
        } ${scrolled ? "bg-white/95 py-[5px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] backdrop-blur-[8px]" : ""}`}
      >
        <div className="pt-10">
          <Container>
            <div className="relative flex items-center justify-between rounded-[5px] border border-[#292929] bg-ink p-[25px]">
              <Link href="/" aria-label="Home" className="flex-none">
                <SiteImage
                  src="/images/ieee-cs-sbc-of-iit-yellow-white.webp"
                  alt="IEEECS"
                  priority
                  sizes="200px"
                  className="w-[200px] max-sm:w-[150px] max-xs:w-[120px]"
                />
              </Link>
              <nav
                className={`ml-auto self-center max-md:absolute max-md:top-full max-md:right-0 max-md:left-0 max-md:z-[1000] max-md:w-full max-md:border max-md:border-white max-md:bg-black max-md:p-5 ${
                  menuOpen ? "max-md:block" : "max-md:hidden"
                }`}
              >
                {links.map(({ href, label }) => {
                  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`mx-[15px] inline-block border-b-2 py-2.5 text-[17px] font-light text-white uppercase hover:text-brand xl:text-xl max-md:m-0 max-md:block max-md:w-full max-md:border-b max-md:border-white/10 max-md:py-[15px] max-md:text-center max-md:last:border-b-0 ${
                        active ? "border-brand max-md:text-brand" : "border-transparent"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="order-1 ml-5 hidden cursor-pointer border border-white bg-transparent p-2 text-white max-md:block max-sm:ml-2.5"
              >
                <svg viewBox="0 0 24 24" className="size-6 max-xs:size-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
            </div>
          </Container>
        </div>
      </header>
      {/* Spacer matching the fixed header: 40px top + 2px border + 50px padding + logo height (1566x702). */}
      <div
        aria-hidden
        className="h-[calc(92px+200px*702/1566)] max-sm:h-[calc(92px+150px*702/1566)] max-xs:h-[calc(92px+120px*702/1566)]"
      />
    </>
  );
}
