import type { AdminContext } from "../../../_lib/env";
import { errorResponse, HttpError, json, now, readJson } from "../../../_lib/http";
import { audit, deleteFiles, RESPONSE_STATUSES, responseFromRow, type ResponseRow } from "../../../_lib/forms-db";

async function getResponse(db: D1Database, id: string) {
  const row = await db.prepare("SELECT * FROM responses WHERE id = ?").bind(id).first<ResponseRow>();
  if (!row) throw new HttpError(404, "Response not found. It may have been deleted.");
  return row;
}

/** PATCH /api/admin/responses/:id { status?, notes? } */
export const onRequestPatch = async ({ env, params, request, data }: AdminContext) => {
  try {
    const row = await getResponse(env.DB, String(params.id));
    const body = await readJson<{ status?: string; notes?: string }>(request);
    const status = body.status ?? row.status;
    if (!RESPONSE_STATUSES.includes(status as (typeof RESPONSE_STATUSES)[number])) throw new HttpError(400, "Unknown status.");
    const notes = typeof body.notes === "string" ? body.notes.slice(0, 5000) : row.notes;
    const statements = [
      env.DB.prepare("UPDATE responses SET status = ?, notes = ?, updated_at = ?, updated_by = ? WHERE id = ?").bind(
        status,
        notes,
        now(),
        data.email,
        row.id,
      ),
    ];
    if (status !== row.status) statements.push(audit(env.DB, data.email, "response.status", row.id, `${row.status} -> ${status}`));
    await env.DB.batch(statements);
    return json({ response: responseFromRow(await getResponse(env.DB, row.id)) });
  } catch (error) {
    return errorResponse(error);
  }
};

/** DELETE /api/admin/responses/:id: the response and its files. */
export const onRequestDelete = async ({ env, params, data }: AdminContext) => {
  try {
    const row = await getResponse(env.DB, String(params.id));
    const files = responseFromRow(row).files;
    await env.DB.batch([
      env.DB.prepare("DELETE FROM responses WHERE id = ?").bind(row.id),
      audit(env.DB, data.email, "response.delete", row.id, row.form_id),
    ]);
    await deleteFiles(
      env.FILES,
      Object.values(files).map((f) => f.key),
    );
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
};
