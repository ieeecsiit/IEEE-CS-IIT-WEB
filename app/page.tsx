import Link from "next/link";
import { BlogList } from "./_components/blog-list";
import { Container, SectionTitle } from "./_components/container";
import { Counter } from "./_components/counter";
import { EventGrid } from "./_components/event-grid";
import { Hero } from "./_components/hero";
import { Reveal } from "./_components/reveal";
import { JsonLd } from "./_components/json-ld";
import { WhoWeAre } from "./_components/who-we-are";
import { getBlogPosts } from "./_data/blogs";
import { getEvents } from "./_data/events";
import { breadcrumbSchema, eventListSchema, graph, webPageSchema } from "./_lib/jsonld";
import { MEMBER_FORM_URL, VOLUNTEER_PATH } from "./_lib/links";
import { SITE_DESCRIPTION, SITE_NAME } from "./_lib/seo";

const stats = [
  { to: 2017, label: "Founded", plain: true },
  { to: 500, suffix: "+", label: "Members" },
  { to: 20, suffix: "+", label: "Projects completed" },
  { to: 5000, suffix: "+", label: "Delegates" },
];

const joinLinks = [
  { label: "Join as Member", href: MEMBER_FORM_URL, external: true },
  { label: "Join as Volunteer", href: VOLUNTEER_PATH, external: false },
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
      <Hero />

      <section className="border-y border-line">
        <Container>
          <dl className="m-0 grid grid-cols-4 max-md:grid-cols-2">
            {stats.map(({ to, suffix, label, plain }, index) => (
              <Reveal
                key={label}
                from="bottom"
                delay={index * 110}
                className="border-l border-line px-[clamp(1rem,2.5vw,2.5rem)] py-[clamp(2rem,4vw,3.5rem)] flex flex-col-reverse first:border-l-0 first:pl-0 max-md:odd:border-l-0 max-md:odd:pl-0 max-md:nth-[n+3]:border-t"
              >
                <dt className="text-lg leading-none font-light text-ink/60">{label}</dt>
                <dd className="m-0 mb-3 text-[clamp(2.8rem,6vw,5.5rem)] leading-none font-medium tracking-[-0.04em] text-ink">
                  {plain ? to : <Counter to={to} />}
                  {suffix && <span className="text-brand">{suffix}</span>}
                </dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      <WhoWeAre />

      <section className="pt-[clamp(5rem,10vw,9rem)]">
        <Container>
          <div className="relative">
            <SectionTitle>Our events</SectionTitle>
            <Link
              href="/events"
              className="absolute top-3 right-0 text-lg leading-none text-ink underline decoration-brand decoration-2 underline-offset-8 transition-colors duration-300 hover:text-ember max-sm:hidden"
            >
              All events
            </Link>
          </div>
          <EventGrid events={events.slice(0, 3)} />
        </Container>
      </section>

      <section className="pt-[clamp(5rem,10vw,9rem)]">
        <Container>
          <SectionTitle>Our blogs</SectionTitle>
          <BlogList posts={blogPosts.slice(0, 3)} />
        </Container>
      </section>

      <section id="join" className="scroll-mt-24 pt-[clamp(5rem,10vw,9rem)]">
        <Container>
          <Reveal from="bottom" className="relative overflow-hidden rounded-[28px] bg-brand px-[clamp(1.5rem,5vw,4.5rem)] py-[clamp(3rem,7vw,6rem)]">
            <div aria-hidden className="logo-mark pointer-events-none absolute -right-[10%] -bottom-[45%] w-[48%] bg-white/25" />
            <h2 className="relative m-0 max-w-[14ch] text-[clamp(2.6rem,7vw,6rem)] leading-[0.98] font-semibold tracking-[-0.035em] text-ink">
              Build with us.
            </h2>
            <p className="relative mt-6 mb-10 max-w-[38ch] text-[clamp(1.2rem,2vw,1.6rem)] leading-snug font-normal text-ink/80">
              Join as a member to take part in our events, or volunteer to help run them.
            </p>
            <div className="relative flex flex-wrap gap-4">
              {joinLinks.map(({ label, href, external }, index) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`rounded-full px-8 py-5 text-xl leading-none font-medium transition-colors duration-300 ${
                    index === 0 ? "bg-ink text-white hover:bg-white hover:text-ink" : "bg-white/0 text-ink ring-2 ring-ink hover:bg-ink hover:text-white"
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
