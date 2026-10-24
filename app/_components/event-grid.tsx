import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/app/_data/types";
import { Reveal } from "./reveal";

export function EventGrid({ events }: { events: Event[] }) {
  if (!events.length) {
    return <p className="text-black">No events to show right now. Check back soon.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-x-5 gap-y-10 max-sm:grid-cols-1">
      {events.map((event) => (
        <Reveal key={event.slug} from="bottom">
          <Link href={`/events/${event.slug}`} className="block text-black">
            <div className="flex w-full max-w-[500px] items-center justify-center overflow-hidden">
              <Image
                {...event.coverImage}
                alt={event.coverImage.alt}
                sizes="(max-width: 767px) 100vw, 33vw"
                className="size-full object-cover"
              />
            </div>
            <h3 className="mt-[30px] mb-5 text-[40px] leading-10 font-extralight max-xs:text-[30px] max-xs:leading-[30px]">
              {event.title}
            </h3>
            <div className="inline-block rounded-[5px] bg-brand p-2 text-base leading-[17px] font-semibold text-white uppercase">
              {event.monthLabel}
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
