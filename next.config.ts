import type { NextConfig } from "next";

const cmsUrl = new URL(process.env.CMS_URL ?? "https://ieee.iit.ac.lk");

// Old static-site URLs, kept working via permanent redirects.
const legacyPages: Record<string, string> = {
  "/index.html": "/",
  "/about.html": "/about",
  "/events.html": "/events",
  "/blog.html": "/blog",
  "/contact.html": "/contact",
  // Event pages now come from the CMS under new slugs, so old event URLs land on the list.
  ...Object.fromEntries(
    [
      "stackmedium", "commitdev", "coderally6-0", "CampusToCeo", "industpro4-0", "webspire2-0",
      "coderally5-0", "industpro3-0", "webspire1-0", "imagine-cup", "after-party", "postman",
    ].map((page) => [`/${page}.html`, "/events"]),
  ),
  "/singleblog-4.html": "/blog/multimodal-ai",
  "/singleblog-3.html": "/blog/home-robot",
  "/singleblog-2.html": "/blog/ai-in-2025",
  "/singleblog-1.html": "/blog/generative-ai-takeover",
};

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Event photos are served by the CMS.
    remotePatterns: [
      {
        protocol: cmsUrl.protocol.replace(":", "") as "http" | "https",
        hostname: cmsUrl.hostname,
        port: cmsUrl.port,
        pathname: "/api/media/file/**",
      },
    ],
  },
  async redirects() {
    return Object.entries(legacyPages).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
