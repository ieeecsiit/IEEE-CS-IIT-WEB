import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/app/_components/container";
import { JsonLd } from "@/app/_components/json-ld";
import { PageHeader } from "@/app/_components/page-header";
import { PhotoGallery } from "@/app/_components/photo-gallery";
import { getEvent, getEvents } from "@/app/_data/events";
import type { ContentBlock } from "@/app/_data/types";
import { breadcrumbSchema, eventSchema, graph, webPageSchema } from "@/app/_lib/jsonld";
import { pageMetadata } from "@/app/_lib/seo";

type Props = { params: Promise<{ slug: string }> };

// Exported as static files, so only the pages generated at build time exist.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getEvents()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  if (!event) return {};
  return pageMetadata({
    title: event.title,
    description: event.summary ?? `${event.title}, held ${event.dateLabel} by the IEEE Computer Society Student Branch Chapter of IIT.`,
    path: `/events/${event.slug}`,
    image: { url: event.coverImage.src, width: event.coverImage.width, height: event.coverImage.height, alt: event.coverImage.alt },
    keywords: [event.title],
  });
}

function Block({ block }: { block: ContentBlock }) {
  if (block.type === "html") {
    return <div className="rich-text mb-5 last:mb-0" dangerouslySetInnerHTML={{ __html: block.html }} />;
  }
  return block.type === "heading" ? <h4>{block.text}</h4> : <p className="mb-5 last:mb-0">{block.text}</p>;
}

const detailItem =
  "border-l border-black pl-5 xl:pl-10 max-sm:border-b max-sm:border-l-0 max-sm:border-white max-sm:pb-5 max-sm:pl-0";
const detailHeading = "mt-0 mb-5 text-xl font-extralight uppercase";

export default async function EventPage({ params }: Props) {
  const event = await getEvent((await params).slug);
  if (!event) notFound();

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({
            path: `/events/${event.slug}`,
            name: event.title,
            description: event.summary ?? event.title,
            image: event.coverImage.src,
          }),
          breadcrumbSchema(`/events/${event.slug}`, [
            { name: "Our Events", path: "/events" },
            { name: event.title, path: `/events/${event.slug}` },
          ]),
          eventSchema(event),
        )}
      />
      <PageHeader title="Our Events" titleAs="p" />
      <section className="py-[50px]">
        <Container>
          <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-[50px]">
            <div>
              <h1 className="mt-0 mb-10 text-[50px] leading-10 font-extralight text-black uppercase">{event.title}</h1>
              <div className="grid grid-cols-[1.2fr_0.5fr] gap-2.5 text-black max-sm:grid-cols-1 max-sm:gap-[35px]">
                <div className={detailItem}>
                  <h3 className={detailHeading}>About the event</h3>
                  <div className="text-lg">
                    {event.content.map((block, index) => (
                      <Block key={index} block={block} />
                    ))}
                  </div>
                </div>
                <div className={detailItem}>
                  <h3 className={detailHeading}>date</h3>
                  <div className="text-lg">{event.dateLabel}</div>
                  {event.location && (
                    <>
                      <h3 className={`${detailHeading} mt-10`}>location</h3>
                      <div className="text-lg">{event.location}</div>
                    </>
                  )}
                </div>
              </div>
              {event.registrationLink && (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-[50px] inline-block rounded-[5px] border border-brand bg-transparent px-10 py-2.5 text-brand uppercase"
                >
                  register
                </a>
              )}
            </div>
            <PhotoGallery photos={event.gallery} />
          </div>
        </Container>
      </section>
    </>
  );
}
