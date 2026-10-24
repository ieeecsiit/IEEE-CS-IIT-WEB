import Link from "next/link";
import { Container } from "./_components/container";
import { PageHeader } from "./_components/page-header";

export default function NotFound() {
  return (
    <>
      <PageHeader title="Not found" tagline="This page doesn't exist" />
      <section className="py-[100px]">
        <Container>
          <Link href="/" className="inline-block rounded-[5px] bg-brand px-5 py-2.5 font-medium text-white hover:bg-ink">
            Back to home
          </Link>
        </Container>
      </section>
    </>
  );
}
