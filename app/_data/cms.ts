import "server-only";

import { PHASE_PRODUCTION_BUILD } from "next/constants";
import type { Photo } from "./types";

/**
 * Events and blog posts come from the IEEE Student Branch site's Payload CMS
 * (https://github.com/IEEE-SB-of-IIT/ieee-iit-site). Its REST API is public and
 * read-only, so no credentials are needed.
 */
export const CMS_URL = (process.env.CMS_URL ?? "https://ieee.iit.ac.lk").replace(/\/$/, "");

/** Fallback refresh interval, in case a change notification from the CMS is missed. */
const REVALIDATE_SECONDS = 300;

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
 * Every doc of a collection matching `query`, cached under `tag` so
 * `/api/revalidate` can clear it when the CMS changes. `label` names the
 * content in errors.
 */
export async function fetchCollection<T>(
  collection: string,
  query: Record<string, string>,
  tag: string,
  label: string,
): Promise<T[]> {
  try {
    const response = await fetch(`${CMS_URL}/api/${collection}?${new URLSearchParams(query)}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [tag] },
    });
    if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
    return ((await response.json()) as { docs: T[] }).docs;
  } catch (error) {
    // A build has no earlier copy to fall back on, so it goes ahead without them.
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
      console.error(`Could not load ${label} from ${CMS_URL}:`, error);
      return [];
    }
    // At runtime, failing the refresh keeps the last good page cached instead of an empty list.
    throw new Error(`Could not load ${label} from ${CMS_URL}`, { cause: error });
  }
}
