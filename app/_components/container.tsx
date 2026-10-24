import type { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-full px-2.5 text-xl leading-5 font-light xl:max-w-[1400px] xl:px-0 2xl:max-w-[1700px]">
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-0 mb-[50px] border-b border-brand text-[80px] leading-[50px] font-semibold text-black uppercase max-xs:text-[30px] max-xs:leading-[19px]">
      {children}
    </h2>
  );
}
