import Link from "next/link";
import { MEMBER_FORM_URL, SOCIAL_LINKS, VOLUNTEER_PATH } from "../_lib/links";

type FooterLink = { label: string; href: string; external?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "About", href: "/about" },
      { label: "Events", href: "/events" },
      { label: "Blog", href: "/blog" },
      { label: "Merch (soon)", href: "/merch" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { label: "Volunteer", href: VOLUNTEER_PATH },
      { label: "Become a member", href: MEMBER_FORM_URL, external: true },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    title: "Follow",
    links: SOCIAL_LINKS.map((social) => ({ ...social, external: true })),
  },
];

const linkClass = "text-base leading-none text-white/80 transition-colors duration-200 hover:text-brand";

function FooterLinkItem({ label, href, external }: FooterLink) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {label}
        <span aria-hidden className="ml-1 text-white/35">
          ↗
        </span>
      </a>
    );
  }
  return (
    <Link href={href} className={linkClass}>
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="mt-[clamp(5rem,10vw,8rem)] px-3 pb-3">
      <div className="relative mx-auto max-w-full overflow-hidden rounded-[28px] bg-ink text-white xl:max-w-[1400px] 2xl:max-w-[1700px]">
        <div aria-hidden className="logo-mark pointer-events-none absolute -right-[4%] -bottom-[30%] w-[min(34%,420px)] bg-white/[0.035]" />

        <div className="relative px-[clamp(1.5rem,4vw,3.5rem)] pt-[clamp(2.5rem,5vw,3.5rem)] pb-6">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-x-10 gap-y-10 max-md:grid-cols-3 max-xs:grid-cols-2">
            <div className="max-md:col-span-3 max-xs:col-span-2">
              <Link href="/" aria-label="IEEE CS IIT, home" className="flex w-fit items-center gap-3">
                <span className="logo-mark size-11 bg-brand" />
                <span className="flex flex-col gap-1">
                  <span className="text-lg leading-none font-semibold tracking-tight">IEEE Computer Society</span>
                  <span className="text-sm leading-none font-light text-white/55">Student Branch Chapter of IIT</span>
                </span>
              </Link>
              <p className="mt-6 mb-0 max-w-[32ch] text-base leading-relaxed font-light text-white/60">
                Hackathons, contests and workshops for students at the Informatics Institute of Technology, since 2017.
              </p>
              <a
                href="mailto:ieeecs@iit.ac.lk"
                className="mt-5 inline-block text-xl leading-none font-normal text-white underline decoration-brand decoration-2 underline-offset-[6px] transition-colors duration-200 hover:text-brand"
              >
                ieeecs@iit.ac.lk
              </a>
            </div>

            {columns.map(({ title, links }, index) => (
              // On phones the last column (socials) spans the row and wraps, so the footer stays short.
              <nav key={title} aria-label={title} className={index === columns.length - 1 ? "max-xs:col-span-2" : undefined}>
                <h3 className="m-0 mb-4 text-sm leading-none font-medium tracking-[0.08em] text-white/40 uppercase">{title}</h3>
                <ul
                  className={`m-0 flex list-none flex-col gap-3 p-0 ${index === columns.length - 1 ? "max-xs:flex-row max-xs:flex-wrap max-xs:gap-x-5" : ""}`}
                >
                  {links.map((link) => (
                    <li key={link.href}>
                      <FooterLinkItem {...link} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-[clamp(2rem,5vw,3.5rem)] flex items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-sm leading-snug font-light text-white/45 max-sm:flex-col max-sm:items-start">
            <p className="m-0 leading-snug">
              © {new Date().getFullYear()} IEEE CS SBC of IIT
              <span className="mx-2 text-white/20">·</span>
              <span className="whitespace-nowrap">No 10, Trelawney Place, Colombo 04</span>
            </p>
            <a href="#top" className="transition-colors duration-200 hover:text-brand">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
