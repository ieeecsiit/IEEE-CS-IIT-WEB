import { buildLlmsTxt } from "@/app/_lib/llms";

/** Served at /llms-full.txt: llms.txt with the full text of every event and blog post inlined. */
export const dynamic = "force-static";

export function GET() {
  return buildLlmsTxt({ full: true });
}
