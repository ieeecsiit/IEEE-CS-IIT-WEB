import { buildLlmsTxt } from "@/app/_lib/llms";

/** Served at /llms.txt: what the chapter is, its key pages, and every event and post as a link. */
export const dynamic = "force-static";

export function GET() {
  return buildLlmsTxt({ full: false });
}
