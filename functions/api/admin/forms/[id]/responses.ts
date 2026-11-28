import type { AdminContext } from "../../../../_lib/env";
import { errorResponse, json } from "../../../../_lib/http";
import { loadResponses } from "../../../../_lib/responses";

/** GET /api/admin/forms/:id/responses: every response, with each form version they used. */
export const onRequestGet = async ({ env, params }: AdminContext) => {
  try {
    return json(await loadResponses(env.DB, String(params.id)));
  } catch (error) {
    return errorResponse(error);
  }
};
