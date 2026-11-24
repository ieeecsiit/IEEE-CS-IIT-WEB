import Link from "next/link";
import { BlogList } from "./_components/blog-list";
import { CountUp } from "./_components/count-up";
import { CursorGlow } from "./_components/cursor-glow";
import { Container, SectionTitle } from "./_components/container";
import { EventGrid } from "./_components/event-grid";
import { Reveal } from "./_components/reveal";
import { SiteImage } from "./_components/site-image";
import { JsonLd } from "./_components/json-ld";
import { Typewriter } from "./_components/typewriter";
import { WhoWeAre } from "./_components/who-we-are";
import { getBlogPosts } from "./_data/blogs";
import { getEvents } from "./_data/events";
import { breadcrumbSchema, eventListSchema, graph, webPageSchema } from "./_lib/jsonld";
import { SITE_DESCRIPTION, SITE_NAME } from "./_lib/seo";

const stats = [
  { value: "2017", label: "Onwards", card: "bg-brand", dot: "bg-[#0f0f0f]", count: false },
  { value: "500+", count: true, label: "Memberships", card: "bg-[#4a4a4a]", dot: "bg-[#242424]" },
  { value: "20+", count: true, label: "Completed Projects", card: "bg-[#191919]", dot: "bg-brand" },
  { value: "5000+", count: true, label: "Delegates", card: "bg-[#939393]", dot: "bg-[#b7b7b7]" },
];

const joinLinks = [
  {
    label: "Join as Member",
    href: "https://docs.google.com/forms/d/1axf5zLUlSE3bkauzC3GV4UbEgj6hNz09nER-UZPNXbs/viewform",
  },
  {
    label: "Join as Volunteer",
    href: "https://docs.google.com/forms/d/1XCQPdXQPVMu3WJTOL5Jl2ly0IuPsaDI_vUR795To2PI/viewform",
  },
];

export default async function HomePage() {
  const [events, blogPosts] = await Promise.all([getEvents(), getBlogPosts()]);

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/", name: SITE_NAME, description: SITE_DESCRIPTION }),
          breadcrumbSchema("/", []),
          eventListSchema(events.slice(0, 3)),
        )}
      />
      <section className="relative flex h-screen items-center justify-center overflow-hidden bg-radial from-brand to-white [--logo:400px] max-md:[--logo:250px] max-sm:[--logo:200px] max-xs:[--logo:150px]">
        {/* Depth: dot texture and slow drifting light, all white so the hero colours are unchanged */}
        <div aria-hidden className="hero-dots pointer-events-none absolute inset-0" />
        <div aria-hidden className="hero-orb pointer-events-none absolute top-[8%] left-[6%] size-[38vmax] rounded-full opacity-50" />
        <div
          aria-hidden
          className="hero-orb pointer-events-none absolute right-[4%] bottom-[6%] size-[30vmax] rounded-full opacity-40 [animation-delay:-7s] [animation-direction:alternate-reverse]"
        />
        <CursorGlow />
        <h1 className="sr-only">IEEE Computer Society Student Branch Chapter of IIT</h1>

        {/* Logo stays dead centre (matches the preloader); everything else is positioned around it */}
        <div data-hero-logo className="relative z-10 w-full max-w-[400px] max-md:max-w-[250px] max-sm:max-w-[200px] max-xs:max-w-[150px]">
          <SiteImage
            src="/images/ieee-cs-sbc-of-iit-white.webp"
            alt="IEEE Computer Society SBC of IIT"
            priority
            sizes="400px"
            className="h-auto w-full object-contain"
          />
        </div>

        <a
          href="#stats"
          aria-label="Scroll to content"
          style={{ "--i": 0 } as React.CSSProperties }
          className="hero-rise absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-2 text-ink [@media(max-height:560px)]:hidden"
        >
          <span className="text-xs font-medium tracking-[0.3em] uppercase">Scroll</span>
          <span className="scroll-cue flex h-10 w-6 items-start justify-center rounded-full border-2 border-ink/60 pt-2" />
        </a>
      </section>

      <Typewriter text="INNOVATE • AUTOMATE • DOMINATE •" />

      <div id="stats" className="scroll-mt-4">
        <Container>
          <div className="grid grid-cols-4 gap-5 text-white max-md:grid-cols-2 max-sm:gap-3">
            {stats.map(({ value, label, card, dot, count }) => (
              <Reveal key={label} from="flip" className="flex">
                <div
                  className={`flex min-h-80 w-full flex-col max-sm:min-h-64 rounded-[5px] p-5 shadow-none transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_18px_40px_-12px_rgb(0_0_0/0.45)] ${card}`}
                >
                  <div className={`size-5 rounded-full ${dot}`} />
                  <div className="mt-auto">
                    <div className="mb-[15px] text-[70px] leading-[50px] font-medium max-sm:text-[44px] max-sm:leading-[44px]">
                      {count ? <CountUp value={value} /> : value}
                    </div>
                    <div className="capitalize">{label}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </div>

      <WhoWeAre />

      <section className="pt-[150px] max-sm:pt-24">
        <Container>
          <div className="relative">
            <SectionTitle>Our Events</SectionTitle>
            <Link
              href="/events"
              className="absolute top-2.5 right-0 text-lg text-black uppercase max-xs:top-0"
            >
              All Projects
            </Link>
          </div>
          <EventGrid events={events.slice(0, 3)} />
        </Container>
      </section>

      <section className="pt-[150px] max-sm:pt-24">
        <Container>
          <SectionTitle>Our Blogs</SectionTitle>
          <BlogList posts={blogPosts.slice(0, 3)} />
        </Container>
      </section>

      <section className="bg-white px-5 py-[50px] text-left max-sm:py-10">
        <Container>
          <h2 className="relative z-[1] mt-5 mb-[30px] border-b border-brand text-[5rem] leading-[0.6] font-semibold text-black uppercase max-sm:text-center max-sm:text-[2.5rem]">
            Join Us
          </h2>
          <p className="mb-10 text-[2.5rem] leading-normal text-black max-sm:text-center max-sm:text-[1.5rem] max-sm:leading-snug">
            Become a part of our community and contribute to the world of technology. Whether you want to be a member or
            volunteer, we welcome you!
          </p>
          <div className="flex justify-center gap-[30px] max-sm:flex-col max-sm:gap-5 max-sm:text-center">
            {joinLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-[5px] bg-brand px-[30px] py-5 text-2xl font-medium text-white transition-colors duration-300 hover:bg-ink"
              >
                {label}
              </a>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
