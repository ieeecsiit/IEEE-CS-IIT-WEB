import type { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/seo";

// Written to a file at build time; the site is exported as static files.
export const dynamic = "force-static";

/**
 * Served at /robots.txt. Everything on the site is public. AI crawlers are named and allowed
 * deliberately: the chapter wants to be cited, and llms.txt exists to help them do it accurately.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
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
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
