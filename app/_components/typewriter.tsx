"use client";

import { useEffect, useRef, useState } from "react";

export function Typewriter({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  // Only animate while the text is fully on screen.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= 1), {
      threshold: [0, 1],
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative flex h-[300px] items-center justify-center overflow-hidden border-t border-brand/20 bg-linear-to-b from-brand/10 to-white px-8 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[5px] max-md:h-[250px] max-sm:h-[200px] max-xs:h-[180px]">
      <div className="relative mx-auto flex h-full w-full max-w-[1200px] items-center justify-center px-4 text-center before:absolute before:-top-5 before:left-1/2 before:h-1 before:w-[100px] before:-translate-x-1/2 before:rounded-sm before:bg-linear-to-r before:from-brand/0 before:via-brand before:to-brand/0">
        <div
          ref={ref}
          className={`mx-auto w-fit max-w-full animate-typewriter overflow-hidden border-r-4 border-brand bg-linear-45 from-black via-brand to-black bg-size-[200%_auto] bg-clip-text p-0 text-[3.5rem] leading-[1.4] font-semibold tracking-[2px] whitespace-nowrap text-transparent [text-shadow:2px_2px_4px_rgba(0,0,0,0.1)] max-md:text-[2.2rem] max-md:leading-[1.3] max-md:tracking-[1.5px] max-sm:w-full max-sm:text-[1.6rem] max-sm:leading-[1.2] max-sm:tracking-[1px] max-sm:whitespace-normal max-xs:text-[1.3rem] max-xs:tracking-[0.5px] ${
            inView ? "" : "[animation-play-state:paused]"
          }`}
        >
          {text}
        </div>
      </div>
    </section>
  );
}
