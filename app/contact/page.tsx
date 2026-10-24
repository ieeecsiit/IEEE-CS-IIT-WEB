import type { Metadata } from "next";
import { Container } from "@/app/_components/container";
import { JsonLd } from "@/app/_components/json-ld";
import { PageHeader } from "@/app/_components/page-header";
import { breadcrumbSchema, graph, webPageSchema } from "@/app/_lib/jsonld";
import { pageMetadata } from "@/app/_lib/seo";
import { ContactForm } from "./contact-form";

const description =
  "Get in touch with the IEEE Computer Society Student Branch Chapter of IIT: email ieeecs@iit.ac.lk, visit us at No 10, Trelawney Place, Colombo 04, or send us a message.";

export const metadata: Metadata = pageMetadata({ title: "Contact", description, path: "/contact" });

const contacts = [
  { phone: "+94704460101", label: "+94 70 446 0101 - Kithsara Medawewa" },
  { phone: "+94755278882", label: "+94 75 527 8882 - Vinuka Jayavihan" },
];

const address = ["IEEE Computer Society SBC of IIT", "No 10,", "Trelawney Place,", "Colombo 04"];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/contact", name: "Contact", description, type: "ContactPage" }),
          breadcrumbSchema("/contact", [{ name: "Contact", path: "/contact" }]),
        )}
      />
      <PageHeader title="contact" />
      <section className="pt-[100px] pb-[50px]">
        <Container>
          <div className="grid grid-cols-2 gap-5 text-black xl:gap-[70px] max-sm:mt-[60px] max-sm:grid-cols-1 max-sm:gap-[50px]">
            <div className="flex flex-col">
              <p className="mb-[30px] border-b border-brand pb-[30px] text-[40px] leading-10">
                We&apos;re dedicated to empowering individuals alike. Let&apos;s explore opportunities together.
              </p>
              <address className="mb-[30px] not-italic">
                {address.map((line) => (
                  <p key={line} className="leading-7">
                    {line}
                  </p>
                ))}
              </address>
              {contacts.map(({ phone, label }) => (
                <a key={phone} href={`tel:${phone}`} className="mb-[5px] text-lg leading-[18px] text-black">
                  {label}
                </a>
              ))}
            </div>
            <div className="flex flex-col">
              <h2 className="mt-0 mb-[30px] text-[30px] leading-[30px] font-normal text-brand capitalize">
                drop us a line
              </h2>
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
