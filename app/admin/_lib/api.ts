import type { Answers, FormDefinition, StoredFile } from "@/shared/forms";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

/** Calls the admin API. Throws ApiError; status 401 means the Access session has ended. */
export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/admin${path}`, {
      method: options.method ?? "GET",
      headers: {
        "x-admin-request": "1",
        ...(options.body !== undefined ? { "content-type": "application/json" } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
      credentials: "same-origin",
      redirect: "manual",
    });
  } catch {
    throw new ApiError(0, "Couldn't reach the server. Check your connection and try again.");
  }
  // Cloudflare Access redirects to its login page once the session has expired.
  if (response.type === "opaqueredirect") throw new ApiError(401, "Your sign-in has expired.");
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new ApiError(response.status, String(data.error ?? `Request failed (${response.status}).`), data);
  return data as T;
}

export const STATUSES = ["new", "shortlisted", "accepted", "rejected"] as const;
export type ResponseStatus = (typeof STATUSES)[number];
export const STATUS_LABELS: Record<ResponseStatus, string> = {
  new: "New",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
};

export type FormSummary = {
  id: string;
  slug: string;
  title: string;
  isOpen: boolean;
  acceptingResponses: boolean;
  closesAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  responses: { total: number; byStatus: Record<string, number>; latest: string | null };
};

export type AdminForm = {
  id: string;
  slug: string;
  version: number;
  isOpen: boolean;
  acceptingResponses: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  definition: FormDefinition;
};

export type AdminResponse = {
  id: string;
  formId: string;
  formVersion: number;
  answers: Answers;
  files: Record<string, StoredFile>;
  status: ResponseStatus;
  notes: string;
  createdAt: string;
  updatedAt: string | null;
  updatedBy: string | null;
};

export const fileUrl = (key: string, download = false) => `/api/admin/files/${key}${download ? "?download" : ""}`;

export function formatDate(iso: string | null | undefined, withTime = true) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
}

export function timeAgo(iso: string | null | undefined) {
  if (!iso) return "";
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)} d ago`;
  return formatDate(iso, false);
}
