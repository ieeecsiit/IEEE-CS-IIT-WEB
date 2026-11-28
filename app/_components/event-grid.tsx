import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/app/_data/types";
import { Reveal } from "./reveal";

export function EventGrid({ events }: { events: Event[] }) {
  if (!events.length) {
    return <p className="text-ink">No events to show right now. Check back soon.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-x-5 gap-y-10 max-sm:grid-cols-1">
      {events.map((event, index) => (
        <Reveal key={event.slug} from="bottom" delay={(index % 3) * 110}>
          <Link href={`/events/${event.slug}`} className="group block text-ink">
            {/* Fixed 4:3 frame, so portrait and landscape covers line up across the grid. */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-[14px] bg-line">
              <Image
                src={event.coverImage.src}
                alt={event.coverImage.alt}
                fill
                sizes="(max-width: 767px) 100vw, 33vw"
                className="object-cover transition-transform duration-[900ms] ease-out-quart group-hover:scale-[1.05]"
              />
            </div>
            <h3 className="mt-6 mb-4 text-[clamp(1.9rem,3vw,2.6rem)] leading-[1.05] font-light tracking-[-0.02em] transition-colors duration-300 group-hover:text-ember">
              {event.title}
            </h3>
            <div className="inline-block rounded-full bg-brand px-4 py-2 text-base leading-none font-medium text-ink">
              {event.monthLabel}
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
