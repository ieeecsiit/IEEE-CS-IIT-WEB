import type { AdminContext } from "../../../_lib/env";
import { errorResponse, HttpError } from "../../../_lib/http";
import { safeFileName } from "../../../_lib/files";

/** GET /api/admin/files/forms/<form>/<response>/<question>.<ext>[?download] */
export const onRequestGet = async ({ env, params, request }: AdminContext) => {
  try {
    const key = (Array.isArray(params.path) ? params.path : [params.path]).join("/");
    if (!/^forms\/[\w-]+\/[\w-]+\/[\w-]+\.[a-z]+$/.test(key)) throw new HttpError(404, "File not found.");
    const object = await env.FILES.get(key);
    if (!object) throw new HttpError(404, "File not found.");

    const contentType = object.httpMetadata?.contentType ?? "application/octet-stream";
    const name = safeFileName(object.customMetadata?.originalName ?? key.split("/").pop()!);
    const previewable = /^image\/(jpeg|png|webp)$|^application\/pdf$/.test(contentType);
    const inline = previewable && !new URL(request.url).searchParams.has("download");
    return new Response(object.body, {
      headers: {
        "content-type": contentType,
        "content-length": String(object.size),
        "content-disposition": `${inline ? "inline" : "attachment"}; filename="${name}"`,
        "x-content-type-options": "nosniff",
        "cache-control": "private, max-age=300",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
};
