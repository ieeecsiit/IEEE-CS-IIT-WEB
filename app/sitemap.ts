import type { MetadataRoute } from "next";
import { getBlogPosts } from "./_data/blogs";
import { getEvents } from "./_data/events";
import { executiveCommittee, standingCommittee } from "./_data/team";
import { OG_IMAGE, absoluteUrl } from "./_lib/seo";

/**
 * Served at /sitemap.xml, with image entries so event and blog photos show up in image search.
 * Refreshed alongside the CMS content it lists.
 */
export const revalidate = 300;

/** Newest of a set of ISO timestamps, so a listing page changes when one of its items does. */
const latest = (dates: string[]) => (dates.length ? new Date(dates.reduce((a, b) => (a > b ? a : b))) : undefined);

/** A CMS outage shouldn't take the sitemap down: crawlers back off after a 500 here. */
async function orEmpty<T>(load: () => Promise<T[]>): Promise<T[]> {
  try {
    return await load();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, posts] = await Promise.all([orEmpty(getEvents), orEmpty(getBlogPosts)]);
  const eventsUpdated = latest(events.map((event) => event.updatedAt));
  const postsUpdated = latest(posts.map((post) => post.updatedAt));
  const anyUpdated = latest([...events, ...posts].map((item) => item.updatedAt));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: anyUpdated,
      changeFrequency: "weekly",
      priority: 1,
      images: [absoluteUrl(OG_IMAGE.url)],
    },
    { url: absoluteUrl("/events"), lastModified: eventsUpdated, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog"), lastModified: postsUpdated, changeFrequency: "weekly", priority: 0.8 },
    {
      url: absoluteUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.7,
      images: [...executiveCommittee, ...standingCommittee].map((member) => absoluteUrl(member.image)),
    },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
    ...events.map((event) => ({
      url: absoluteUrl(`/events/${event.slug}`),
      lastModified: new Date(event.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [...new Set([event.coverImage, ...event.gallery].map((photo) => photo.src))].slice(0, 50),
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: "yearly" as const,
      priority: 0.6,
      images: [post.image.src],
    })),
  ];
}
