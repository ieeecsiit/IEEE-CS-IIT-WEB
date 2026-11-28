import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/app/_components/container";
import { JsonLd } from "@/app/_components/json-ld";
import { PageHeader } from "@/app/_components/page-header";
import { breadcrumbSchema, graph, webPageSchema } from "@/app/_lib/jsonld";
import { pageMetadata } from "@/app/_lib/seo";
import { VolunteerForm } from "./volunteer-form";

const description =
  "Volunteer with the IEEE Computer Society Student Branch Chapter of IIT: join a team that designs, writes, films, codes and runs our hackathons, contests and workshops.";

export const metadata: Metadata = pageMetadata({ title: "Volunteer", description, path: "/volunteer" });

export default function VolunteerPage() {
  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/volunteer", name: "Volunteer", description }),
          breadcrumbSchema("/volunteer", [{ name: "Volunteer", path: "/volunteer" }]),
        )}
      />
      <PageHeader title="Volunteer" tagline="Help us run the events you love" />
      <section className="pt-[clamp(2.5rem,6vw,5rem)]">
        <Container>
          <Suspense fallback={<FormSkeleton />}>
            <VolunteerForm />
          </Suspense>
        </Container>
      </section>
    </>
  );
}

function FormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading the form" className="grid max-w-3xl animate-pulse gap-6">
      <div className="h-10 w-2/3 rounded-xl bg-black/5" />
      <div className="h-24 rounded-xl bg-black/5" />
      <div className="h-14 rounded-xl bg-black/5" />
      <div className="h-14 rounded-xl bg-black/5" />
    </div>
  );
}
