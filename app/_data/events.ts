import "server-only";

import { fetchCollection, toPhoto, type CmsMedia, withoutBlankParagraphs } from "./cms";
import type { ContentBlock, Event, Photo } from "./types";

/** Cache tag on the event list; `/api/revalidate` clears it when the CMS changes. */
export const EVENTS_TAG = "cms-events";

const TIME_ZONE = "Asia/Colombo";

// Subset of the CMS's generated `Event` type that this site reads.
type CmsEvent = {
  slug: string;
  name: string;
  /** Plain text, blank lines between paragraphs. */
  description: string;
  /** The same description with its formatting, from the CMS's rich text editor. */
  contentHtml?: string | null;
  date: string;
  updatedAt: string;
  location?: string | null;
  registrationLink?: string | null;
  coverImage: number | CmsMedia;
  images?: (number | CmsMedia)[] | null;
  sessions?: { title: string; description?: string | null }[] | null;
};

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Date(value).toLocaleDateString("en-US", { timeZone: TIME_ZONE, ...options });
}

/** Blank lines separate paragraphs. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** The formatted description when the CMS has one, then each session as a sub-heading. */
function toContent(event: CmsEvent): ContentBlock[] {
  const text = (value: string): ContentBlock[] =>
    paragraphs(value).map((paragraph) => ({ type: "paragraph", text: paragraph }));

  return [
    ...(event.contentHtml ? [{ type: "html", html: withoutBlankParagraphs(event.contentHtml) } as const] : text(event.description)),
    ...(event.sessions ?? []).flatMap((session): ContentBlock[] => [
      { type: "heading", text: session.title },
      ...text(session.description ?? ""),
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
    summary: paragraphs(event.description)[0],
    text: [
      ...paragraphs(event.description),
      ...(event.sessions ?? []).flatMap((session) => [session.title, ...paragraphs(session.description ?? "")]),
    ],
    date: event.date,
    updatedAt: event.updatedAt,
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
  const docs = await fetchCollection<CmsEvent>(
    "events",
    {
      "where[and][0][society][in]": "CS",
      "where[and][1][publishToProjects][equals]": "true",
      sort: "-date",
      depth: "1",
      limit: "100",
    },
    EVENTS_TAG,
    "events",
  );
  return docs.map(toEvent).filter((event): event is Event => !!event);
}

export async function getEvent(slug: string) {
  return (await getEvents()).find((event) => event.slug === slug);
}
