import type { Metadata } from "next";
import { Container, SectionTitle } from "@/app/_components/container";
import { JsonLd } from "@/app/_components/json-ld";
import { PageHeader } from "@/app/_components/page-header";
import { TeamGroup } from "@/app/_components/team-grid";
import { WhoWeAre } from "@/app/_components/who-we-are";
import { executiveCommittee, standingCommittee } from "@/app/_data/team";
import { breadcrumbSchema, graph, teamSchema, webPageSchema } from "@/app/_lib/jsonld";
import { pageMetadata } from "@/app/_lib/seo";

const description =
  "Who we are, what we do, and the team behind the IEEE Computer Society Student Branch Chapter of IIT: our mission, our vision, and the executive and standing committee for this term.";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description,
  path: "/about",
  keywords: ["IEEE CS IIT committee", "IEEE Computer Society IIT team"],
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/about", name: "About Us", description, type: "AboutPage" }),
          breadcrumbSchema("/about", [{ name: "About Us", path: "/about" }]),
          ...teamSchema([
            { name: "Executive Committee", members: executiveCommittee },
            { name: "Standing Committee Leads", members: standingCommittee },
          ]),
        )}
      />
      <PageHeader title="about Us" />
      <WhoWeAre />
      <section className="mx-auto max-w-[1200px] px-5 py-[100px]">
        <Container>
          <SectionTitle>Our Team</SectionTitle>
          <div className="mx-auto max-w-[1200px] px-5 py-[100px]">
            <TeamGroup title="Executive Committee" members={executiveCommittee} />
            <TeamGroup title="Standing Committee Leads" members={standingCommittee} />
          </div>
        </Container>
      </section>
    </>
  );
}
