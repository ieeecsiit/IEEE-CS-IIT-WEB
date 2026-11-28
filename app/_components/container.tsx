import type { ReactNode } from "react";
import { Reveal } from "./reveal";

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-full px-5 text-xl leading-5 font-light xl:max-w-[1440px] 2xl:max-w-[1740px]">
      {children}
    </div>
  );
}

/** Section heading with a hairline that draws itself underneath. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-12 max-sm:mb-8">
      <h2 className="mt-0 mb-5 text-[clamp(2.4rem,6vw,5rem)] leading-none font-semibold tracking-[-0.03em] text-ink">
        {children}
      </h2>
      <Reveal from="rule" className="h-px w-full bg-brand" />
    </div>
  );
}
