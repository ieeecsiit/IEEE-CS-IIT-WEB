import type { PublicContext } from "../../../_lib/env";
import { errorResponse, HttpError, json } from "../../../_lib/http";
import { formFromRow, type FormRow } from "../../../_lib/forms-db";

/** GET /api/forms/:slug: the form a visitor fills in. Draft (never opened) forms are not found. */
export const onRequestGet = async ({ env, params }: PublicContext) => {
  try {
    const row = await env.DB.prepare("SELECT * FROM forms WHERE slug = ?").bind(String(params.slug)).first<FormRow>();
    if (!row) throw new HttpError(404, "This form doesn't exist.");
    const form = formFromRow(row);
    const { settings } = form.definition;
    if (!form.acceptingResponses) {
      return json({ slug: form.slug, accepting: false, title: settings.title, closedMessage: settings.closedMessage });
    }
    return json({ slug: form.slug, accepting: true, version: form.version, definition: form.definition });
  } catch (error) {
    return errorResponse(error);
  }
};
