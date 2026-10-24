import type { NextConfig } from "next";

/**
 * Exported as plain static files for Cloudflare Pages (`out/`). There is no server, so:
 * - CMS content is fetched at build time, and the CMS triggers a Pages rebuild when it changes;
 * - images are served as they are (the CMS and `npm run images` already store them as WebP);
 * - redirects live in `public/_redirects`, which Pages reads.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
