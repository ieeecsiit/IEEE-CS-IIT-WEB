import Link from "next/link";
import { BlogList } from "./_components/blog-list";
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
  { value: "2017", label: "Onwards", card: "bg-brand", dot: "bg-[#0f0f0f]" },
  { value: "500+", label: "Memberships", card: "bg-[#4a4a4a]", dot: "bg-[#242424]" },
  { value: "20+", label: "Completed Projects", card: "bg-[#191919]", dot: "bg-brand" },
  { value: "5000+", label: "Delegates", card: "bg-[#939393]", dot: "bg-[#b7b7b7]" },
];

const joinLinks = [
  {
    label: "Join as Member",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSemPpr4U7r-gbvnuoQ4KbZ6zF0mJDb6ob_H22CI2OAPxyI66Q/viewform?usp=dialog",
  },
  {
    label: "Join as Volunteer",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSfpxw9R8z2diUb9NFS37GTZ9bFAN9nCWRNhvgV_50s7dE1n0w/viewform?usp=dialog",
  },
];

export const revalidate = 300;

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
      <section className="relative flex h-screen items-center justify-center bg-radial from-brand to-white">
        <h1 className="sr-only">IEEE Computer Society Student Branch Chapter of IIT</h1>
        <SiteImage
          src="/images/ieee-cs-sbc-of-iit-white.webp"
          alt="IEEE Computer Society SBC of IIT"
          priority
          sizes="400px"
          className="h-auto w-full max-w-[400px] object-contain max-md:max-w-[250px] max-sm:max-w-[200px] max-xs:max-w-[150px]"
        />
      </section>

      <Typewriter text="INNOVATE • AUTOMATE • DOMINATE •" />

      <Container>
        <div className="grid grid-cols-4 gap-5 text-white max-md:grid-cols-2 max-xs:grid-cols-1">
          {stats.map(({ value, label, card, dot }) => (
            <Reveal key={label} from="flip" className={`flex min-h-80 flex-col rounded-[5px] p-5 ${card}`}>
              <div className={`size-5 rounded-full ${dot}`} />
              <div className="mt-auto">
                <div className="mb-[15px] text-[70px] leading-[50px] font-medium">{value}</div>
                <div className="capitalize">{label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <WhoWeAre />

      <section className="pt-[150px]">
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

      <section className="pt-[150px]">
        <Container>
          <SectionTitle>Our Blogs</SectionTitle>
          <BlogList posts={blogPosts.slice(0, 3)} />
        </Container>
      </section>

      <section className="bg-white px-5 py-[50px] text-left">
        <Container>
          <h2 className="relative z-[1] mt-5 mb-[30px] border-b border-brand text-[5rem] leading-[0.6] font-semibold text-black uppercase max-sm:text-center max-sm:text-[2.5rem]">
            Join Us
          </h2>
          <p className="mb-10 text-[2.5rem] leading-normal text-black max-sm:text-center max-sm:text-[1.8rem]">
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
