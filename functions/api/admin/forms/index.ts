import type { AdminContext } from "../../../_lib/env";
import { errorResponse, HttpError, json, now, readJson } from "../../../_lib/http";
import { audit, formFromRow, getFormRow, type FormRow } from "../../../_lib/forms-db";
import { blankForm, isValidSlug, sanitizeDefinition, volunteerTemplate, type FormDefinition } from "../../../../shared/forms";

/** GET /api/admin/forms: every form, with response counts by status. */
export const onRequestGet = async ({ env }: AdminContext) => {
  try {
    const [forms, counts] = await env.DB.batch([
      env.DB.prepare("SELECT * FROM forms ORDER BY created_at DESC"),
      env.DB.prepare("SELECT form_id, status, COUNT(*) AS n, MAX(created_at) AS latest FROM responses GROUP BY form_id, status"),
    ]);
    const tally = new Map<string, { total: number; byStatus: Record<string, number>; latest: string | null }>();
    for (const row of counts.results as { form_id: string; status: string; n: number; latest: string }[]) {
      const entry = tally.get(row.form_id) ?? { total: 0, byStatus: {}, latest: null };
      entry.total += row.n;
      entry.byStatus[row.status] = row.n;
      if (!entry.latest || row.latest > entry.latest) entry.latest = row.latest;
      tally.set(row.form_id, entry);
    }
    return json({
      forms: (forms.results as FormRow[]).map((row) => {
        const form = formFromRow(row);
        return {
          id: form.id,
          slug: form.slug,
          title: form.definition.settings.title,
          isOpen: form.isOpen,
          acceptingResponses: form.acceptingResponses,
          closesAt: form.definition.settings.closesAt,
          version: form.version,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
          updatedBy: form.updatedBy,
          responses: tally.get(form.id) ?? { total: 0, byStatus: {}, latest: null },
        };
      }),
    });
  } catch (error) {
    return errorResponse(error);
  }
};

/** POST /api/admin/forms { slug, from: "volunteer" | "blank" | <form id to copy> } */
export const onRequestPost = async ({ env, request, data }: AdminContext) => {
  try {
    const body = await readJson<{ slug?: string; from?: string; title?: string }>(request);
    const slug = String(body.slug ?? "").trim().toLowerCase();
    if (!isValidSlug(slug)) throw new HttpError(400, "The link name can only use lowercase letters, numbers and dashes.");

    let definition: FormDefinition;
    if (body.from === "volunteer") definition = volunteerTemplate();
    else if (!body.from || body.from === "blank") definition = blankForm();
    else definition = formFromRow(await getFormRow(env.DB, body.from)).definition;
    if (body.title?.trim()) definition.settings.title = body.title.trim();

    const { form, error } = sanitizeDefinition(definition);
    if (!form) throw new HttpError(400, error ?? "Invalid form.");

    const id = crypto.randomUUID();
    const at = now();
    const text = JSON.stringify(form);
    try {
      await env.DB.batch([
        env.DB.prepare(
          "INSERT INTO forms (id, slug, definition, version, is_open, created_at, updated_at, updated_by) VALUES (?, ?, ?, 1, 0, ?, ?, ?)",
        ).bind(id, slug, text, at, at, data.email),
        env.DB.prepare("INSERT INTO form_versions (form_id, version, definition, created_at, created_by) VALUES (?, 1, ?, ?, ?)").bind(
          id,
          text,
          at,
          data.email,
        ),
        audit(env.DB, data.email, "form.create", id, slug),
      ]);
    } catch (error) {
      if (String(error).includes("UNIQUE")) throw new HttpError(409, `Another form already uses the link "${slug}".`);
      throw error;
    }
    return json({ id }, 201);
  } catch (error) {
    return errorResponse(error);
  }
};
