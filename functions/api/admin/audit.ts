import type { AdminContext } from "../../_lib/env";
import { errorResponse, json } from "../../_lib/http";

/** GET /api/admin/audit: the latest 300 admin actions. */
export const onRequestGet = async ({ env }: AdminContext) => {
  try {
    const { results } = await env.DB.prepare("SELECT at, actor, action, target, detail FROM audit_log ORDER BY id DESC LIMIT 300").all();
    return json({ entries: results });
  } catch (error) {
    return errorResponse(error);
  }
};
