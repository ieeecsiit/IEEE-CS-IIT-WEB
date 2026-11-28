import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function config(phase: string): NextConfig {
  return {
    // Static files for Cloudflare Pages. The API (volunteer forms, admin) is Pages Functions in functions/.
    output: "export",
    images: {
      unoptimized: true,
    },
    // In development the API runs separately under `npm run dev:api` (wrangler, port 8788).
    ...(phase === PHASE_DEVELOPMENT_SERVER
      ? { rewrites: async () => [{ source: "/api/:path*", destination: "http://127.0.0.1:8788/api/:path*" }] }
      : {}),
  };
}
