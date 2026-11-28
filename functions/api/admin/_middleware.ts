import { requireAdmin } from "../../_lib/access";
import type { AdminContext } from "../../_lib/env";
import { errorResponse, HttpError } from "../../_lib/http";

/**
 * Every /api/admin/* request: verify the Cloudflare Access sign-in, and make sure writes come
 * from the admin panel itself (a custom header can't be sent cross-site without CORS, which we
 * never allow).
 */
export const onRequest = async (context: AdminContext) => {
  try {
    const { request, env } = context;
    if (request.method !== "GET" && request.method !== "HEAD" && request.headers.get("x-admin-request") !== "1") {
      throw new HttpError(403, "Requests must come from the admin panel.");
    }
    context.data.email = await requireAdmin(request, env);
    const response = await context.next();
    response.headers.set("cache-control", "no-store");
    response.headers.set("x-robots-tag", "noindex");
    return response;
  } catch (error) {
    return errorResponse(error);
  }
};
