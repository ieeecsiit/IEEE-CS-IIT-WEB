import type { PublicContext } from "../../_lib/env";
import { errorResponse, json } from "../../_lib/http";
import { formFromRow, type FormRow } from "../../_lib/forms-db";

/** GET /api/forms: forms that are taking responses right now. */
export const onRequestGet = async ({ env }: PublicContext) => {
  try {
    const { results } = await env.DB.prepare("SELECT * FROM forms WHERE is_open = 1 ORDER BY updated_at DESC").all<FormRow>();
    const forms = results
      .map(formFromRow)
      .filter((form) => form.acceptingResponses)
      .map((form) => ({ slug: form.slug, title: form.definition.settings.title, closesAt: form.definition.settings.closesAt }));
    return json({ forms }, 200, { "cache-control": "public, max-age=30" });
  } catch (error) {
    return errorResponse(error);
  }
};
