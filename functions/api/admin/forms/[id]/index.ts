import type { AdminContext } from "../../../../_lib/env";
import { errorResponse, HttpError, json, now, readJson } from "../../../../_lib/http";
import { audit, deleteFiles, formFromRow, getFormRow } from "../../../../_lib/forms-db";
import { isValidSlug, sanitizeDefinition } from "../../../../../shared/forms";

/** GET /api/admin/forms/:id */
export const onRequestGet = async ({ env, params }: AdminContext) => {
  try {
    return json({ form: formFromRow(await getFormRow(env.DB, String(params.id))) });
  } catch (error) {
    return errorResponse(error);
  }
};

/**
 * PUT /api/admin/forms/:id { definition, slug, baseVersion }
 * Saves a new version. `baseVersion` must be the version the editor started from, so two people
 * editing at once can't silently overwrite each other.
 */
export const onRequestPut = async ({ env, params, request, data }: AdminContext) => {
  try {
    const row = await getFormRow(env.DB, String(params.id));
    const body = await readJson<{ definition?: unknown; slug?: string; baseVersion?: number }>(request);
    if (body.baseVersion !== row.version) {
      const current = formFromRow(row);
      throw new HttpError(409, `${current.updatedBy || "Someone"} saved this form while you were editing it. Reload to see their changes.`, {
        conflict: true,
      });
    }
    const { form, error } = sanitizeDefinition(body.definition);
    if (!form) throw new HttpError(400, error ?? "Invalid form.");
    const slug = String(body.slug ?? row.slug).trim().toLowerCase();
    if (!isValidSlug(slug)) throw new HttpError(400, "The link name can only use lowercase letters, numbers and dashes.");

    const version = row.version + 1;
    const text = JSON.stringify(form);
    const at = now();
    try {
      // The batch is one transaction. If two saves race, both try to insert the same
      // (form_id, version) and the second one fails as a whole.
      await env.DB.batch([
        env.DB.prepare("INSERT INTO form_versions (form_id, version, definition, created_at, created_by) VALUES (?, ?, ?, ?, ?)").bind(
          row.id,
          version,
          text,
          at,
          data.email,
        ),
        env.DB.prepare("UPDATE forms SET definition = ?, slug = ?, version = ?, updated_at = ?, updated_by = ? WHERE id = ?").bind(
          text,
          slug,
          version,
          at,
          data.email,
          row.id,
        ),
        audit(env.DB, data.email, "form.save", row.id, `v${version}`),
      ]);
    } catch (error) {
      const message = String(error);
      if (message.includes("UNIQUE") && message.includes("slug")) throw new HttpError(409, `Another form already uses the link "${slug}".`);
      if (message.includes("UNIQUE") || message.includes("PRIMARY KEY")) {
        throw new HttpError(409, "Someone else saved this form at the same moment. Reload and try again.", { conflict: true });
      }
      throw error;
    }
    return json({ form: formFromRow(await getFormRow(env.DB, row.id)) });
  } catch (error) {
    return errorResponse(error);
  }
};

/** PATCH /api/admin/forms/:id { isOpen } */
export const onRequestPatch = async ({ env, params, request, data }: AdminContext) => {
  try {
    const row = await getFormRow(env.DB, String(params.id));
    const body = await readJson<{ isOpen?: boolean }>(request);
    if (typeof body.isOpen !== "boolean") throw new HttpError(400, "Nothing to change.");
    await env.DB.batch([
      env.DB.prepare("UPDATE forms SET is_open = ?, updated_at = ?, updated_by = ? WHERE id = ?").bind(body.isOpen ? 1 : 0, now(), data.email, row.id),
      audit(env.DB, data.email, body.isOpen ? "form.open" : "form.close", row.id, row.slug),
    ]);
    return json({ form: formFromRow(await getFormRow(env.DB, row.id)) });
  } catch (error) {
    return errorResponse(error);
  }
};

/** DELETE /api/admin/forms/:id { confirmSlug }: the form, every response and every uploaded file. */
export const onRequestDelete = async ({ env, params, request, data }: AdminContext) => {
  try {
    const row = await getFormRow(env.DB, String(params.id));
    const body = await readJson<{ confirmSlug?: string }>(request);
    if (body.confirmSlug !== row.slug) throw new HttpError(400, "Type the form's link name to confirm.");

    // Delete the files first: if that fails part-way, the rows still point at what's left.
    let cursor: string | undefined;
    do {
      const page = await env.FILES.list({ prefix: `forms/${row.id}/`, cursor });
      await deleteFiles(env.FILES, page.objects.map((o) => o.key));
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);

    await env.DB.batch([
      env.DB.prepare("DELETE FROM responses WHERE form_id = ?").bind(row.id),
      env.DB.prepare("DELETE FROM form_versions WHERE form_id = ?").bind(row.id),
      env.DB.prepare("DELETE FROM forms WHERE id = ?").bind(row.id),
      audit(env.DB, data.email, "form.delete", row.id, row.slug),
    ]);
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
};
