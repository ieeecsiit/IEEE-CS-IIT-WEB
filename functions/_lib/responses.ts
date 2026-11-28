import type { FormDefinition } from "../../shared/forms";
import { parseJson } from "./http";
import { formFromRow, responseFromRow, getFormRow, type ResponseRow } from "./forms-db";

/** A form's responses, plus every version of the form they were made against. */
export async function loadResponses(db: D1Database, formId: string) {
  const formRow = await getFormRow(db, formId);
  const [responses, versions] = await db.batch([
    db.prepare("SELECT * FROM responses WHERE form_id = ? ORDER BY created_at DESC").bind(formId),
    db.prepare("SELECT version, definition FROM form_versions WHERE form_id = ?").bind(formId),
  ]);
  const definitions: Record<number, FormDefinition> = {};
  for (const row of versions.results as { version: number; definition: string }[]) {
    definitions[row.version] = parseJson<FormDefinition>(row.definition, { settings: {} as FormDefinition["settings"], sections: [] });
  }
  return {
    form: formFromRow(formRow),
    versions: definitions,
    responses: (responses.results as ResponseRow[]).map(responseFromRow),
  };
}

export { responseColumns } from "../../shared/forms";
