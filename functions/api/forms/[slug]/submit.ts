import type { PublicContext } from "../../../_lib/env";
import { errorResponse, HttpError, json, now } from "../../../_lib/http";
import { deleteFiles, formFromRow, type FormRow } from "../../../_lib/forms-db";
import { sniff } from "../../../_lib/files";
import {
  allFields,
  dedupeKey,
  isVisible,
  MAX_FILE_MB,
  validateAnswers,
  type Answers,
  type FileMeta,
  type StoredFile,
} from "../../../../shared/forms";

const MAX_BODY = 50 * 1024 * 1024;
const RESPONSE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const result = (await response.json()) as { success: boolean };
  return result.success;
}

/**
 * POST /api/forms/:slug/submit (multipart/form-data)
 *   id         UUID made by the browser; resending the same id never creates a second response
 *   answers    JSON object of answers by question id
 *   file:<id>  uploaded file for a file question
 *   turnstile  Turnstile token (when TURNSTILE_SECRET_KEY is set)
 *   website    honeypot, must be empty
 */
export const onRequestPost = async ({ request, env, params }: PublicContext) => {
  const uploaded: string[] = [];
  try {
    const length = Number(request.headers.get("content-length") ?? 0);
    if (length > MAX_BODY) throw new HttpError(413, "The upload is too large.");

    let body: FormData;
    try {
      body = await request.formData();
    } catch {
      throw new HttpError(400, "The form data could not be read. Please try again.");
    }

    const id = String(body.get("id") ?? "");
    if (!RESPONSE_ID.test(id)) throw new HttpError(400, "Invalid submission. Please reload the page and try again.");

    // Bots fill every field; people never see this one.
    if (String(body.get("website") ?? "") !== "") return json({ ok: true, id });

    const row = await env.DB.prepare("SELECT * FROM forms WHERE slug = ?").bind(String(params.slug)).first<FormRow>();
    if (!row) throw new HttpError(404, "This form doesn't exist anymore.");
    const form = formFromRow(row);

    // A retry of a submission that already went through: report success again.
    const existing = await env.DB.prepare("SELECT id FROM responses WHERE id = ?").bind(id).first();
    if (existing) return json({ ok: true, id, message: form.definition.settings.successMessage });

    if (!form.acceptingResponses) throw new HttpError(403, form.definition.settings.closedMessage || "This form is closed.");

    if (env.TURNSTILE_SECRET_KEY) {
      const token = String(body.get("turnstile") ?? "");
      const ok = token !== "" && (await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, request.headers.get("cf-connecting-ip")));
      if (!ok) throw new HttpError(400, "We couldn't confirm you're not a robot. Please try again.", { retryTurnstile: true });
    }

    let rawAnswers: Answers;
    try {
      rawAnswers = JSON.parse(String(body.get("answers") ?? "{}"));
      if (!rawAnswers || typeof rawAnswers !== "object" || Array.isArray(rawAnswers)) throw new Error();
    } catch {
      throw new HttpError(400, "Invalid answers.");
    }

    const fields = allFields(form.definition);
    const fileFields = fields.filter((f) => f.type === "file" && isVisible(f, fields, rawAnswers));
    const files = new Map<string, File>();
    const fileMeta: Record<string, FileMeta> = {};
    for (const field of fileFields) {
      const value = body.get(`file:${field.id}`);
      if (value && typeof value === "object" && "arrayBuffer" in value) {
        const file = value as unknown as File;
        files.set(field.id, file);
        fileMeta[field.id] = { name: file.name, size: file.size };
      }
    }

    const { answers, errors } = validateAnswers(form.definition, rawAnswers, fileMeta);

    // Check each file's real type against what the question accepts.
    const sniffed = new Map<string, ReturnType<typeof sniff>>();
    for (const [fieldId, file] of files) {
      if (errors[fieldId]) continue;
      const field = fields.find((f) => f.id === fieldId)!;
      const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
      const type = sniff(head, file.name);
      if (!type || !(field.accept ?? []).includes(type.kind)) {
        errors[fieldId] = "This file type isn't accepted here.";
        continue;
      }
      if (file.size > (field.maxSizeMB || MAX_FILE_MB) * 1024 * 1024) {
        errors[fieldId] = `The file is too large. The limit is ${field.maxSizeMB || MAX_FILE_MB} MB.`;
        continue;
      }
      sniffed.set(fieldId, type);
    }

    if (Object.keys(errors).length) {
      throw new HttpError(422, "Some answers need fixing.", {
        errors,
        // The form was edited while this person was filling it in.
        formChanged: Number(body.get("version") ?? 0) !== form.version,
      });
    }

    const { uniqueFieldId } = form.definition.settings;
    const dedupe = uniqueFieldId ? dedupeKey(answers[uniqueFieldId]) : null;
    if (dedupe) {
      const duplicate = await env.DB.prepare("SELECT id FROM responses WHERE form_id = ? AND dedupe_key = ?").bind(form.id, dedupe).first();
      if (duplicate) {
        throw new HttpError(409, "We already have a response from you for this form. Contact us if you need to change it.", {
          errors: { [uniqueFieldId!]: "A response with this answer was already submitted." },
        });
      }
    }

    // Files first, then the row: if the row fails, the files are removed again.
    const storedFiles: Record<string, StoredFile> = {};
    for (const [fieldId, type] of sniffed) {
      const file = files.get(fieldId)!;
      const key = `forms/${form.id}/${id}/${fieldId}.${type!.ext}`;
      await env.FILES.put(key, file.stream(), {
        httpMetadata: { contentType: type!.contentType },
        customMetadata: { originalName: file.name.slice(0, 200) },
      });
      uploaded.push(key);
      storedFiles[fieldId] = { key, name: file.name.slice(0, 200), size: file.size, contentType: type!.contentType };
    }

    try {
      await env.DB.prepare(
        `INSERT INTO responses (id, form_id, form_version, answers, files, dedupe_key, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'new', ?)`,
      )
        .bind(id, form.id, form.version, JSON.stringify(answers), JSON.stringify(storedFiles), dedupe, now())
        .run();
    } catch (error) {
      const message = String(error);
      if (message.includes("UNIQUE") && message.includes("responses.id")) {
        // Two copies of the same submission raced; the other one won and kept the same file keys.
        uploaded.length = 0;
        return json({ ok: true, id, message: form.definition.settings.successMessage });
      }
      if (message.includes("UNIQUE") && message.includes("dedupe_key")) {
        throw new HttpError(409, "We already have a response from you for this form. Contact us if you need to change it.");
      }
      throw error;
    }

    uploaded.length = 0;
    return json({ ok: true, id, message: form.definition.settings.successMessage });
  } catch (error) {
    await deleteFiles(env.FILES, uploaded);
    return errorResponse(error);
  }
};
