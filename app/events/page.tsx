import type { Metadata } from "next";
import { Container } from "@/app/_components/container";
import { EventGrid } from "@/app/_components/event-grid";
import { JsonLd } from "@/app/_components/json-ld";
import { PageHeader } from "@/app/_components/page-header";
import { getEvents } from "@/app/_data/events";
import { breadcrumbSchema, eventListSchema, graph, webPageSchema } from "@/app/_lib/jsonld";
import { pageMetadata } from "@/app/_lib/seo";

export const revalidate = 300;

const description =
  "Hackathons, competitive programming contests, web development workshops and career guidance series run by the IEEE Computer Society Student Branch Chapter of IIT, including CodeRally, IndustPro, WebSpire and Commit.dev.";

export const metadata: Metadata = pageMetadata({
  title: "Our Events",
  description,
  path: "/events",
  keywords: ["CodeRally", "IndustPro", "WebSpire", "Commit.dev", "hackathon Sri Lanka", "IIT events"],
});

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/events", name: "Our Events", description, type: "CollectionPage" }),
          breadcrumbSchema("/events", [{ name: "Our Events", path: "/events" }]),
          eventListSchema(events),
        )}
      />
      <PageHeader title="Our Events" />
      <section className="py-[50px]">
        <Container>
          <EventGrid events={events} />
        </Container>
      </section>
    </>
  );
}
