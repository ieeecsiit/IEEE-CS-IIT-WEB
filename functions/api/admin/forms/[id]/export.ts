import type { AdminContext } from "../../../../_lib/env";
import { errorResponse } from "../../../../_lib/http";
import { audit } from "../../../../_lib/forms-db";
import { loadResponses, responseColumns } from "../../../../_lib/responses";

function cell(value: string) {
  // Stop spreadsheet apps from running answers like "=HYPERLINK(...)" as formulas.
  // Plain numbers and phone numbers ("+94 77 ...") are left alone.
  const formula = /^[=+\-@\t\r]/.test(value) && !/^[+-]?[\d\s().-]+$/.test(value);
  const safe = formula ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** GET /api/admin/forms/:id/export?status=accepted: responses as CSV (UTF-8 with BOM, for Excel). */
export const onRequestGet = async ({ env, params, request, data }: AdminContext) => {
  try {
    const { form, versions, responses } = await loadResponses(env.DB, String(params.id));
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const rows = status ? responses.filter((r) => r.status === status) : responses;
    const columns = responseColumns(form.definition, versions);

    const header = ["Submitted at", "Status", "Notes", ...columns.map((c) => c.label)];
    const lines = [header.map(cell).join(",")];
    for (const response of [...rows].reverse()) {
      const values = columns.map((column) => {
        const file = response.files[column.id];
        if (file) return `${file.name} (${url.origin}/api/admin/files/${file.key})`;
        const answer = response.answers[column.id];
        return Array.isArray(answer) ? answer.join("; ") : (answer ?? "");
      });
      lines.push([response.createdAt, response.status, response.notes, ...values].map((v) => cell(String(v))).join(","));
    }

    await audit(env.DB, data.email, "responses.export", form.id, status ?? "all").run();
    const name = `${form.slug}-responses${status ? `-${status}` : ""}-${new Date().toISOString().slice(0, 10)}.csv`;
    return new Response("﻿" + lines.join("\r\n"), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${name}"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
};
