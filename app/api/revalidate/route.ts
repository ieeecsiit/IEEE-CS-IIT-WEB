import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { BLOGS_TAG } from "@/app/_data/blogs";
import { EVENTS_TAG } from "@/app/_data/events";

/**
 * Called by the CMS whenever a CS event or a blog post is created, edited or deleted, so the
 * change shows up on the next page view instead of after the 5-minute fallback refresh.
 *
 *   POST /api/revalidate
 *   Authorization: Bearer <REVALIDATE_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return Response.json({ revalidated: false, message: "REVALIDATE_SECRET is not set" }, { status: 503 });
  }

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return Response.json({ revalidated: false, message: "Unauthorized" }, { status: 401 });
  }

  // The editor just saved, so skip serving the old copy even once. The ping doesn't say which
  // collection changed, and both lists are a single cheap request to refill.
  revalidateTag(EVENTS_TAG, { expire: 0 });
  revalidateTag(BLOGS_TAG, { expire: 0 });
  return Response.json({ revalidated: true, now: Date.now() });
}
