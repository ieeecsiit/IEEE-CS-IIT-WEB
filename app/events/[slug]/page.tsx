import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/app/_components/container";
import { PageHeader } from "@/app/_components/page-header";
import { PhotoGallery } from "@/app/_components/photo-gallery";
import { getEvent, getEvents } from "@/app/_data/events";
import type { ContentBlock } from "@/app/_data/types";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getEvents()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.summary,
    openGraph: { title: event.title, description: event.summary, images: [event.coverImage.src] },
  };
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
      <PageHeader title="Our Events" />
      <section className="py-[50px]">
        <Container>
          <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-[50px]">
            <div>
              <h2 className="mt-0 mb-10 text-[50px] leading-10 font-extralight text-black uppercase">{event.title}</h2>
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
