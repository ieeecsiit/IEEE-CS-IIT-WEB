import "server-only";

import type { Photo } from "./types";

/**
 * Events and blog posts come from the IEEE Student Branch site's Payload CMS
 * (https://github.com/IEEE-SB-of-IIT/ieee-iit-site). Its REST API is public and
 * read-only, so no credentials are needed.
 */
export const CMS_URL = (process.env.CMS_URL ?? "https://ieee.iit.ac.lk").replace(/\/$/, "");

// Subset of the CMS's generated `Media` type that this site reads.
export type CmsMedia = {
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

export function toPhoto(media: number | CmsMedia | null | undefined, fallbackAlt: string): Photo | undefined {
  if (!media || typeof media !== "object" || !media.url || !media.width || !media.height) return undefined;
  return {
    src: new URL(media.url, CMS_URL).toString(),
    width: media.width,
    height: media.height,
    alt: media.alt?.trim() || fallbackAlt,
  };
}

/**
 * Drops paragraphs with nothing visible in them. Text pasted from the old site carries
 * `<p>&zwj;</p>` spacers, which would otherwise add a blank line between every section.
 */
export function withoutBlankParagraphs(html: string) {
  return html.replace(/<p\b[^>]*>(?:\s|&nbsp;|&zwj;|‍|<br\s*\/?>)*<\/p>/gi, "");
}

/** One request per collection per build process, shared by every page that lists it. */
const requests = new Map<string, Promise<unknown[]>>();

/**
 * Every doc of a collection matching `query`. The site is exported as static files, so this
 * runs only at build time; the CMS triggers a rebuild when content changes.
 *
 * A failed request fails the build on purpose: Cloudflare Pages then keeps serving the last
 * good deployment, instead of publishing a site with no events or posts.
 */
export function fetchCollection<T>(collection: string, query: Record<string, string>, label: string): Promise<T[]> {
  const url = `${CMS_URL}/api/${collection}?${new URLSearchParams(query)}`;
  if (!requests.has(url)) {
    requests.set(
      url,
      fetch(url).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Could not load ${label} from ${CMS_URL}: ${response.status} ${await response.text()}`);
        }
        return ((await response.json()) as { docs: unknown[] }).docs;
      }),
    );
  }
  return requests.get(url) as Promise<T[]>;
}
