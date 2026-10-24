import "server-only";

import { PHASE_PRODUCTION_BUILD } from "next/constants";
import type { ContentBlock, Event, Photo } from "./types";

/**
 * Events come from the IEEE Student Branch site's Payload CMS
 * (https://github.com/IEEE-SB-of-IIT/ieee-iit-site), filtered to the Computer Society.
 * Its REST API is public and read-only, so no credentials are needed.
 */
export const CMS_URL = (process.env.CMS_URL ?? "https://ieee.iit.ac.lk").replace(/\/$/, "");

/** Cache tag on the event list; `/api/revalidate` clears it when the CMS changes. */
export const EVENTS_TAG = "cms-events";

/** Fallback refresh interval, in case a change notification from the CMS is missed. */
const REVALIDATE_SECONDS = 300;
const TIME_ZONE = "Asia/Colombo";

// Subset of the CMS's generated `Event` and `Media` types that this site reads.
type CmsMedia = {
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

type CmsEvent = {
  slug: string;
  name: string;
  description: string;
  date: string;
  location?: string | null;
  registrationLink?: string | null;
  coverImage: number | CmsMedia;
  images?: (number | CmsMedia)[] | null;
  sessions?: { title: string; description?: string | null }[] | null;
};

function toPhoto(media: number | CmsMedia | null | undefined, fallbackAlt: string): Photo | undefined {
  if (!media || typeof media !== "object" || !media.url || !media.width || !media.height) return undefined;
  return {
    src: new URL(media.url, CMS_URL).toString(),
    width: media.width,
    height: media.height,
    alt: media.alt?.trim() || fallbackAlt,
  };
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Date(value).toLocaleDateString("en-US", { timeZone: TIME_ZONE, ...options });
}

/** Blank lines in the CMS description separate paragraphs; each session becomes a sub-heading. */
function toContent(event: CmsEvent): ContentBlock[] {
  const paragraphs = (text: string): ContentBlock[] =>
    text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .map((paragraph) => ({ type: "paragraph", text: paragraph }));

  return [
    ...paragraphs(event.description),
    ...(event.sessions ?? []).flatMap((session): ContentBlock[] => [
      { type: "heading", text: session.title },
      ...paragraphs(session.description ?? ""),
    ]),
  ];
}

function toEvent(event: CmsEvent): Event | undefined {
  const coverImage = toPhoto(event.coverImage, event.name);
  if (!coverImage) return undefined;

  const gallery = (event.images ?? [])
    .map((image, index) => toPhoto(image, `${event.name} photo ${index + 1}`))
    .filter((photo): photo is Photo => !!photo);

  return {
    slug: event.slug,
    title: event.name,
    date: event.date,
    dateLabel: formatDate(event.date, { day: "numeric", month: "long", year: "numeric" }),
    monthLabel: formatDate(event.date, { month: "long", year: "numeric" }),
    location: event.location ?? undefined,
    coverImage,
    content: toContent(event),
    gallery: gallery.length ? gallery : [coverImage],
    // Registration only matters until the event has happened.
    registrationLink:
      new Date(event.date).getTime() >= Date.now() ? (event.registrationLink ?? undefined) : undefined,
  };
}

/** Published Computer Society events, newest first. */
export async function getEvents(): Promise<Event[]> {
  const query = new URLSearchParams({
    "where[and][0][society][in]": "CS",
    "where[and][1][publishToProjects][equals]": "true",
    sort: "-date",
    depth: "1",
    limit: "100",
  });

  try {
    const response = await fetch(`${CMS_URL}/api/events?${query}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [EVENTS_TAG] },
    });
    if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
    const { docs } = (await response.json()) as { docs: CmsEvent[] };
    return docs.map(toEvent).filter((event): event is Event => !!event);
  } catch (error) {
    // A build has no earlier copy to fall back on, so it goes ahead without events.
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
      console.error(`Could not load events from ${CMS_URL}:`, error);
      return [];
    }
    // At runtime, failing the refresh keeps the last good page cached instead of an empty list.
    throw new Error(`Could not load events from ${CMS_URL}`, { cause: error });
  }
}

export async function getEvent(slug: string) {
  return (await getEvents()).find((event) => event.slug === slug);
}
