import type { Metadata } from "next";
import { Container } from "@/app/_components/container";
import { EventGrid } from "@/app/_components/event-grid";
import { PageHeader } from "@/app/_components/page-header";
import { getEvents } from "@/app/_data/events";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Our Events",
  description: "Workshops, hackathons and community events run by the IEEE Computer Society SBC of IIT.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <PageHeader title="Our Events" />
      <section className="py-[50px]">
        <Container>
          <EventGrid events={events} />
        </Container>
      </section>
    </>
  );
}
