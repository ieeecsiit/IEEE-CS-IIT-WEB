import type { Metadata } from "next";
import { Container } from "@/app/_components/container";
import { EventGrid } from "@/app/_components/event-grid";
import { PageHeader } from "@/app/_components/page-header";
import { events } from "@/app/_data/events";

export const metadata: Metadata = {
  title: "Our Events",
  description: "Workshops, hackathons and community events run by the IEEE Computer Society SBC of IIT.",
};

export default function EventsPage() {
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
