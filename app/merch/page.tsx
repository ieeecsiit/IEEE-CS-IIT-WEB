import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/app/_components/container";
import { JsonLd } from "@/app/_components/json-ld";
import { Reveal } from "@/app/_components/reveal";
import { breadcrumbSchema, graph, webPageSchema } from "@/app/_lib/jsonld";
import { pageMetadata } from "@/app/_lib/seo";
import { MerchPreview } from "./merch-preview";

const description =
  "The IEEE Computer Society Student Branch Chapter of IIT merch store is coming soon. Follow us to see the first collection as soon as it is ready.";

export const metadata: Metadata = pageMetadata({ title: "Merch store", description, path: "/merch" });

export default function MerchPage() {
  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/merch", name: "Merch store", description }),
          breadcrumbSchema("/merch", [{ name: "Merch", path: "/merch" }]),
        )}
      />
      <section className="relative isolate overflow-hidden pt-[clamp(1.5rem,5vw,4rem)] pb-[clamp(4rem,8vw,7rem)]">
        <div aria-hidden className="hero-glow absolute inset-0 -z-10 opacity-70" />
        <Container>
          <div className="grid grid-cols-[1fr_1.05fr] items-center gap-x-[clamp(2rem,6vw,6rem)] gap-y-14 max-md:grid-cols-1">
            <div>
              <Reveal from="fade" className="mb-8 inline-flex items-center gap-2.5 rounded-full bg-ink py-2.5 pr-5 pl-3 text-base leading-none text-white">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-70 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-brand" />
                </span>
                Coming soon
              </Reveal>
              <Reveal as="h1" from="left" className="m-0 text-[clamp(3.2rem,8vw,7rem)] leading-[0.95] font-extralight tracking-[-0.04em] text-balance text-ink">
                The merch store is on its way<span className="font-semibold text-brand">.</span>
              </Reveal>
              <Reveal from="bottom" delay={200} className="mt-8 mb-10 max-w-[36ch] text-[clamp(1.15rem,1.7vw,1.4rem)] leading-snug font-light text-ink/75">
                We are putting together the first IEEE CS IIT collection. Follow us to see it the moment it is ready.
              </Reveal>
              <Reveal from="bottom" delay={320} className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <a
                  href="https://www.instagram.com/ieeecs_iit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-ink px-7 py-4 text-lg leading-none font-medium text-white transition-colors duration-300 hover:bg-brand hover:text-ink"
                >
                  Follow on Instagram
                </a>
                <Link
                  href="/"
                  className="text-lg leading-none font-medium text-ink underline decoration-brand decoration-2 underline-offset-[10px] transition-colors duration-300 hover:text-ember"
                >
                  Back to home
                </Link>
              </Reveal>
              <Reveal from="fade" delay={450} className="mt-12 text-lg leading-snug font-light text-ink/60">
                Questions? Write to{" "}
                <a href="mailto:ieeecs@iit.ac.lk" className="text-ink underline decoration-brand underline-offset-4">
                  ieeecs@iit.ac.lk
                </a>
              </Reveal>
            </div>
            <MerchPreview />
          </div>
        </Container>
      </section>
    </>
  );
}
