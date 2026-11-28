import type { FormDefinition, StoredFile, Answers } from "../../shared/forms";
import { isFormOpen } from "../../shared/forms";
import { HttpError, now, parseJson } from "./http";

export type FormRow = {
  id: string;
  slug: string;
  definition: string;
  version: number;
  is_open: number;
  created_at: string;
  updated_at: string;
  updated_by: string;
};

export type ResponseRow = {
  id: string;
  form_id: string;
  form_version: number;
  answers: string;
  files: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
};

export const RESPONSE_STATUSES = ["new", "shortlisted", "accepted", "rejected"] as const;

export function formFromRow(row: FormRow) {
  const definition = parseJson<FormDefinition>(row.definition, { settings: {} as FormDefinition["settings"], sections: [] });
  return {
    id: row.id,
    slug: row.slug,
    version: row.version,
    isOpen: row.is_open === 1,
    acceptingResponses: isFormOpen(row.is_open === 1, definition.settings),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    definition,
  };
}

export function responseFromRow(row: ResponseRow) {
  return {
    id: row.id,
    formId: row.form_id,
    formVersion: row.form_version,
    answers: parseJson<Answers>(row.answers, {}),
    files: parseJson<Record<string, StoredFile>>(row.files, {}),
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export async function getFormRow(db: D1Database, id: string) {
  const row = await db.prepare("SELECT * FROM forms WHERE id = ?").bind(id).first<FormRow>();
  if (!row) throw new HttpError(404, "Form not found.");
  return row;
}

export function audit(db: D1Database, actor: string, action: string, target = "", detail = "") {
  return db.prepare("INSERT INTO audit_log (at, actor, action, target, detail) VALUES (?, ?, ?, ?, ?)").bind(now(), actor, action, target, detail);
}

/** Deletes R2 objects, logging rather than throwing: an orphaned file is better than a failed request. */
export async function deleteFiles(bucket: R2Bucket, keys: string[]) {
  if (keys.length === 0) return;
  try {
    await bucket.delete(keys);
  } catch (error) {
    console.error("Could not delete files", keys, error);
  }
}
