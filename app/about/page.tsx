import type { Metadata } from "next";
import { Container, SectionTitle } from "@/app/_components/container";
import { PageHeader } from "@/app/_components/page-header";
import { TeamGroup } from "@/app/_components/team-grid";
import { WhoWeAre } from "@/app/_components/who-we-are";
import { executiveCommittee, standingCommittee } from "@/app/_data/team";

export const metadata: Metadata = {
  title: "About Us",
  description: "Who we are, what we do, and the team behind the IEEE Computer Society SBC of IIT.",
};

export default function AboutPage() {
  return (
    <>
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
