import { Container } from "./container";
import { Reveal } from "./reveal";

type PageHeaderProps = {
  title: string;
  tagline?: string;
  /** Detail pages pass "p" so their own title can be the page's one <h1>. */
  titleAs?: "h1" | "p";
};

export function PageHeader({ title, tagline = "Who we are and what we do", titleAs = "h1" }: PageHeaderProps) {
  return (
    <div className="pt-6 pb-2">
      <Container>
        <div className="flex items-end justify-between gap-x-10 gap-y-5 border-b border-line pb-8 max-sm:flex-col max-sm:items-start">
          <Reveal
            as={titleAs}
            from="left"
            className="m-0 text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] font-extralight tracking-[-0.04em] text-ink"
          >
            {title}
            <span className="font-semibold text-brand">.</span>
          </Reveal>
          <Reveal from="right" delay={150} className="max-w-[26ch] pb-1 text-xl leading-snug font-light text-ink/60 sm:text-right">
            {tagline}
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
