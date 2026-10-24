import { Container } from "./container";
import { Reveal } from "./reveal";

export function PageHeader({ title, tagline = "Who We are and what we do" }: { title: string; tagline?: string }) {
  return (
    <div className="mt-5">
      <Container>
        <div className="flex items-center rounded-[5px] border border-line p-[50px] max-sm:block max-xs:p-5">
          <Reveal
            as="h1"
            from="left"
            className="m-0 text-[80px] leading-[60px] font-extralight text-black uppercase max-sm:mb-5 max-sm:text-[60px] max-sm:leading-[50px] max-xs:text-[40px] max-xs:leading-10"
          >
            {title}
          </Reveal>
          <Reveal from="right" className="ml-5 rounded-[5px] bg-brand p-2.5 font-medium text-white max-sm:ml-0">
            {tagline}
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
