import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/app/_components/container";
import { PageHeader } from "@/app/_components/page-header";
import { SiteImage } from "@/app/_components/site-image";
import { events, getEvent } from "@/app/_data/events";
import type { ContentBlock } from "@/app/_data/types";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return events.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = getEvent((await params).slug);
  if (!event) return {};
  const description = event.content.find((block) => block.type === "paragraph")?.text;
  return {
    title: event.title,
    description,
    openGraph: { title: event.title, description, images: [event.coverImage] },
  };
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return <h4>{block.text}</h4>;
    case "paragraph":
      return <p className="mb-5 last:mb-0">{block.text}</p>;
    case "list":
      return (
        <ul className="mb-5 space-y-5">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
  }
}

const detailItem =
  "border-l border-black pl-5 xl:pl-10 max-sm:border-b max-sm:border-l-0 max-sm:border-white max-sm:pb-5 max-sm:pl-0";
const detailHeading = "mt-0 mb-5 text-xl font-extralight uppercase";

export default async function EventPage({ params }: Props) {
  const event = getEvent((await params).slug);
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
                  <h3 className={detailHeading}>{event.aboutHeading}</h3>
                  <div className="text-lg">
                    {event.content.map((block, index) => (
                      <Block key={index} block={block} />
                    ))}
                  </div>
                </div>
                <div className={detailItem}>
                  <h3 className={detailHeading}>year</h3>
                  <div className="text-lg">{event.year}</div>
                </div>
              </div>
              {event.website && (
                <a
                  href={event.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-[50px] inline-block rounded-[5px] border border-brand bg-transparent px-10 py-2.5 text-brand uppercase"
                >
                  visit site
                </a>
              )}
            </div>
            <div className="flex flex-wrap content-start items-center gap-x-[3%]">
              {event.gallery.map((src, index) => (
                <SiteImage
                  key={`${src}-${index}`}
                  src={src}
                  alt={`${event.title} photo ${index + 1}`}
                  sizes="(max-width: 767px) 48vw, 24vw"
                  priority={index < 2}
                  className="mb-2.5 h-auto w-[48%]"
                />
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
