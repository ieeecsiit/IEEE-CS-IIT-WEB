import type { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/seo";

/**
 * Served at /robots.txt.
 *
 * /api/ only holds the CMS revalidation hook, nothing to rank. /_next/image stays crawlable
 * because every event and blog photo is served through it. AI crawlers are named and allowed
 * deliberately: the chapter wants to be cited, and llms.txt exists to help them do it accurately.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      {
        // Named explicitly so a future blanket restriction on `*` can't silently cut them off.
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
