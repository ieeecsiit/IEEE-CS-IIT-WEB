import type { NextConfig } from "next";

// Old static-site URLs, kept working via permanent redirects.
const legacyPages: Record<string, string> = {
  "/index.html": "/",
  "/about.html": "/about",
  "/events.html": "/events",
  "/blog.html": "/blog",
  "/contact.html": "/contact",
  "/stackmedium.html": "/events/stackmedium",
  "/commitdev.html": "/events/commitdev",
  "/coderally6-0.html": "/events/coderally6-0",
  "/CampusToCeo.html": "/events/campus-to-ceo",
  "/industpro4-0.html": "/events/industpro4-0",
  "/webspire2-0.html": "/events/webspire2-0",
  "/coderally5-0.html": "/events/coderally5-0",
  "/industpro3-0.html": "/events/industpro3-0",
  "/webspire1-0.html": "/events/webspire1-0",
  "/imagine-cup.html": "/events/imagine-cup",
  "/after-party.html": "/events/after-party",
  "/postman.html": "/events/postman",
  "/singleblog-4.html": "/blog/multimodal-ai",
  "/singleblog-3.html": "/blog/home-robot",
  "/singleblog-2.html": "/blog/ai-in-2025",
  "/singleblog-1.html": "/blog/generative-ai-takeover",
};

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return Object.entries(legacyPages).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
