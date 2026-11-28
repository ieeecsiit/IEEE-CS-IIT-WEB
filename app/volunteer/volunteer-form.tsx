"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FormRenderer, formatBytes } from "@/app/_components/forms/form-renderer";
import { RichText } from "@/app/_components/forms/rich-text";
import { Turnstile, TURNSTILE_SITE_KEY } from "@/app/_components/forms/turnstile";
import {
  allFields,
  FILE_KIND_ACCEPT,
  isVisible,
  validateAnswers,
  type AnswerValue,
  type Answers,
  type FieldErrors,
  type FileMeta,
  type FormDefinition,
} from "@/shared/forms";

type OpenForm = { slug: string; title: string; closesAt: string | null };
type LoadedForm = { slug: string; version: number; definition: FormDefinition };

type State =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "pick"; forms: OpenForm[] }
  | { phase: "none" }
  | { phase: "closed"; title: string; message: string }
  | { phase: "form"; form: LoadedForm }
  | { phase: "done"; title: string; message: string };

type Draft = { id: string; answers: Answers; savedAt: number };
const draftKey = (slug: string) => `ieeecs-form-draft:${slug}`;

function readDraft(slug: string): Draft | null {
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey(slug)) ?? "null") as Draft | null;
    // Drafts older than 30 days are stale.
    if (draft && Date.now() - draft.savedAt < 30 * 86_400_000) return draft;
  } catch {}
  return null;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error ?? "Something went wrong."), { status: response.status });
  return data as T;
}

type SendResult = { status: number; data: Record<string, unknown> };

/** XHR rather than fetch so we can show upload progress. Status 0 means the request never got through. */
function send(url: string, body: FormData, onProgress: (fraction: number) => void): Promise<SendResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.timeout = 5 * 60_000;
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress(event.loaded / event.total);
    xhr.onload = () => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      resolve({ status: xhr.status, data });
    };
    xhr.onerror = xhr.ontimeout = xhr.onabort = () => resolve({ status: 0, data: {} });
    xhr.send(body);
  });
}

function omit<T extends Record<string, unknown>>(record: T, key: string): T {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Works out what to show: the one open form, a list to pick from, or why there's nothing. */
async function fetchState(slug: string | null): Promise<State> {
  try {
    if (!slug) {
      const { forms } = await getJson<{ forms: OpenForm[] }>("/api/forms");
      if (forms.length === 0) return { phase: "none" };
      if (forms.length > 1) return { phase: "pick", forms };
      slug = forms[0].slug;
    }
    const data = await getJson<
      { accepting: true; slug: string; version: number; definition: FormDefinition } | { accepting: false; title: string; closedMessage: string }
    >(`/api/forms/${encodeURIComponent(slug)}`);
    if (!data.accepting) return { phase: "closed", title: data.title, message: data.closedMessage };
    return { phase: "form", form: { slug: data.slug, version: data.version, definition: data.definition } };
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 404) return { phase: "error", message: "We couldn't find that form. It may have been removed." };
    return { phase: "error", message: "We couldn't load the form. Check your connection and try again." };
  }
}

export function VolunteerForm() {
  const params = useSearchParams();
  const slugParam = params.get("f");
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    let active = true;
    void fetchState(slugParam).then((next) => active && setState(next));
    return () => {
      active = false;
    };
  }, [slugParam]);

  const reload = (slug: string | null) => {
    setState({ phase: "loading" });
    void fetchState(slug).then(setState);
  };

  switch (state.phase) {
    case "loading":
      return (
        <div aria-busy="true" className="grid max-w-3xl animate-pulse gap-6">
          <div className="h-10 w-2/3 rounded-xl bg-black/5" />
          <div className="h-24 rounded-xl bg-black/5" />
          <div className="h-14 rounded-xl bg-black/5" />
        </div>
      );
    case "error":
      return (
        <Notice title="Something went wrong" message={state.message}>
          <button
            type="button"
            onClick={() => reload(slugParam)}
            className={primaryButton}
          >
            Try again
          </button>
        </Notice>
      );
    case "none":
      return (
        <Notice
          title="No open calls right now"
          message="We aren't taking volunteer applications at the moment. Follow us on social media to hear when the next call opens."
        >
          <Link href="/events" className={primaryButton}>
            See our events
          </Link>
        </Notice>
      );
    case "closed":
      return <Notice title={state.title} message={state.message} />;
    case "pick":
      return (
        <div className="max-w-3xl">
          <p className="m-0 mb-6 text-xl leading-snug font-light text-ink/70">We have more than one call open. Pick the one you want to apply for:</p>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {state.forms.map((form) => (
              <li key={form.slug}>
                <Link
                  href={`/volunteer?f=${encodeURIComponent(form.slug)}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-line px-6 py-5 text-xl leading-snug font-normal text-ink transition-colors hover:border-brand"
                >
                  <span>
                    {form.title}
                    {form.closesAt && (
                      <span className="mt-1 block text-sm font-light text-ink/55">Closes {new Date(form.closesAt).toLocaleString()}</span>
                    )}
                  </span>
                  <span aria-hidden className="text-brand">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    case "done":
      return (
        <Notice title="Application received" message={state.message} tone="success">
          <Link href="/events" className={primaryButton}>
            Explore our events
          </Link>
        </Notice>
      );
    case "form":
      return (
        <FillForm
          key={`${state.form.slug}:${state.form.version}`}
          form={state.form}
          onDone={(message) => setState({ phase: "done", title: state.form.definition.settings.title, message })}
          onReload={() => reload(state.form.slug)}
        />
      );
  }
}

const primaryButton =
  "inline-flex cursor-pointer items-center justify-center rounded-full bg-ink px-7 py-4 text-lg leading-none font-medium text-white transition-colors duration-300 hover:bg-brand hover:text-ink disabled:cursor-not-allowed disabled:opacity-60";

function Notice({ title, message, tone, children }: { title: string; message: string; tone?: "success"; children?: React.ReactNode }) {
  return (
    <div role="status" className="max-w-2xl rounded-[28px] bg-glow/45 px-[clamp(1.5rem,4vw,3rem)] py-[clamp(2rem,5vw,3.5rem)]">
      {tone === "success" && (
        <span aria-hidden className="mb-6 grid size-14 place-items-center rounded-full bg-brand text-2xl text-ink">
          ✓
        </span>
      )}
      <h2 className="m-0 text-[clamp(1.8rem,3.5vw,2.6rem)] leading-tight font-medium tracking-tight text-ink">{title}</h2>
      <p className="mt-4 mb-0 text-lg leading-relaxed font-light text-ink/75">{message}</p>
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}

function FillForm({ form, onDone, onReload }: { form: LoadedForm; onDone: (message: string) => void; onReload: () => void }) {
  const { definition } = form;
  const { settings } = definition;
  const fields = allFields(definition);
  const hasFiles = fields.some((f) => f.type === "file");

  const [responseId, setResponseId] = useState(() => readDraft(form.slug)?.id ?? crypto.randomUUID());
  const [answers, setAnswers] = useState<Answers>(() => readDraft(form.slug)?.answers ?? {});
  const [restored] = useState(() => readDraft(form.slug) !== null);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<{ tone: "error" | "info"; text: string; retry?: boolean } | null>(null);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Keep a draft so a refresh or a dropped connection never loses someone's answers.
  useEffect(() => {
    try {
      localStorage.setItem(draftKey(form.slug), JSON.stringify({ id: responseId, answers, savedAt: Date.now() } satisfies Draft));
    } catch {}
  }, [answers, form.slug, responseId]);

  const setAnswer = (fieldId: string, value: AnswerValue) => {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
    setErrors((current) => omit(current, fieldId));
  };

  const setFile = (fieldId: string, file: File | null) => {
    setErrors((current) => omit(current, fieldId));
    if (file) {
      const field = fields.find((f) => f.id === fieldId)!;
      const max = (field.maxSizeMB ?? 10) * 1024 * 1024;
      if (file.size > max) {
        setErrors((e) => ({ ...e, [fieldId]: `That file is ${formatBytes(file.size)}. The limit is ${field.maxSizeMB ?? 10} MB.` }));
        return;
      }
      const extensions = (field.accept ?? [])
        .flatMap((kind) => FILE_KIND_ACCEPT[kind].split(","))
        .filter((a) => a.startsWith("."))
        .concat((field.accept ?? []).includes("image") ? [".jpg", ".jpeg", ".png", ".webp"] : []);
      const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
      if (!extensions.includes(ext)) {
        setErrors((e) => ({ ...e, [fieldId]: "This file type isn't accepted here." }));
        return;
      }
    }
    setFiles((current) => ({ ...current, [fieldId]: file }));
  };

  const scrollToFirstError = (errs: FieldErrors) => {
    const first = fields.find((f) => errs[f.id]);
    if (!first) return;
    const element = formRef.current?.querySelector<HTMLElement>(`[data-field="${first.id}"]`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.querySelector<HTMLElement>("input, select, textarea, button")?.focus({ preventScroll: true });
  };

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (sending) return;
    setBanner(null);

    const fileMeta: Record<string, FileMeta> = {};
    for (const [id, file] of Object.entries(files)) if (file) fileMeta[id] = { name: file.name, size: file.size };
    const check = validateAnswers(definition, answers, fileMeta);
    if (Object.keys(check.errors).length) {
      setErrors(check.errors);
      setBanner({ tone: "error", text: "Some answers need fixing. They're highlighted below." });
      scrollToFirstError(check.errors);
      return;
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setBanner({ tone: "info", text: "Just a moment while we check you're not a robot, then press Submit again." });
      return;
    }

    const body = new FormData();
    body.append("id", responseId);
    body.append("version", String(form.version));
    body.append("answers", JSON.stringify(check.answers));
    body.append("website", honeypot.current?.value ?? "");
    body.append("turnstile", turnstileToken);
    for (const field of fields) {
      const file = files[field.id];
      if (field.type === "file" && file && isVisible(field, fields, answers)) body.append(`file:${field.id}`, file, file.name);
    }

    setSending(true);
    setProgress(0);
    let result: SendResult = { status: 0, data: {} };
    // Retry dropped connections and server hiccups. The same id means a retry can never create a duplicate.
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt) await wait(1500 * attempt);
      result = await send(`/api/forms/${encodeURIComponent(form.slug)}/submit`, body, setProgress);
      if (result.status !== 0 && result.status < 500) break;
    }
    setSending(false);

    const { status, data } = result;
    if (status === 200 && data.ok) {
      try {
        localStorage.removeItem(draftKey(form.slug));
      } catch {}
      onDone(String(data.message ?? settings.successMessage));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (TURNSTILE_SITE_KEY) setTurnstileReset((n) => n + 1); // tokens are single use
    if (status === 0) {
      setBanner({ tone: "error", text: "We couldn't reach the server. Your answers are saved on this device. Check your connection and try again.", retry: true });
      return;
    }
    const serverErrors = (data.errors as FieldErrors | undefined) ?? {};
    if (Object.keys(serverErrors).length) {
      setErrors(serverErrors);
      scrollToFirstError(serverErrors);
    }
    if (data.formChanged) {
      setBanner({ tone: "info", text: "This form was updated while you were filling it in. We've loaded the new version and kept your answers." });
      onReload();
      return;
    }
    if (status === 409 && !Object.keys(serverErrors).length) setResponseId(crypto.randomUUID());
    setBanner({
      tone: "error",
      text: String(data.error ?? "Something went wrong on our side. Your answers are saved on this device; please try again in a moment."),
      retry: status >= 500,
    });
  }

  return (
    <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-x-[clamp(2rem,6vw,6rem)] gap-y-12 max-md:grid-cols-1">
      <aside className="md:sticky md:top-28">
        <h2 className="m-0 text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] font-medium tracking-[-0.02em] text-ink">{settings.title}</h2>
        {settings.closesAt && (
          <p className="mt-4 mb-0 inline-block rounded-full bg-glow/60 px-4 py-2 text-sm leading-none font-medium text-ink">
            Closes {new Date(settings.closesAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        )}
        {settings.intro && (
          <a href="#apply" className="mt-5 inline-block text-base font-medium text-ink underline decoration-brand decoration-2 underline-offset-[6px] md:hidden">
            Jump to the form ↓
          </a>
        )}
        {settings.intro && (
          <RichText
            text={settings.intro}
            className="mt-6 max-h-none text-base leading-relaxed font-light text-ink/75 md:max-h-[calc(100vh-14rem)] md:overflow-y-auto md:pr-4"
          />
        )}
      </aside>

      <form ref={formRef} id="apply" onSubmit={submit} noValidate className="min-w-0 scroll-mt-28">
        {restored && Object.keys(answers).length > 0 && (
          <p className="mt-0 mb-8 rounded-xl bg-black/[0.04] px-4 py-3 text-[15px] leading-snug font-light text-ink/70">
            We restored the answers you started earlier on this device.{hasFiles && " Files need to be attached again."}
          </p>
        )}

        <FormRenderer definition={definition} answers={answers} files={files} errors={errors} onAnswer={setAnswer} onFile={setFile} disabled={sending} />

        {/* Honeypot: hidden from people and screen readers, irresistible to bots. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="mt-10">
          <Turnstile onToken={setTurnstileToken} resetKey={turnstileReset} />
        </div>

        {banner && (
          <div
            role="alert"
            className={`mt-6 rounded-xl px-4 py-3.5 text-base leading-snug font-normal ${
              banner.tone === "error" ? "bg-red-50 text-red-700" : "bg-glow/60 text-ink"
            }`}
          >
            {banner.text}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-5">
          <button type="submit" disabled={sending} className={primaryButton}>
            {sending ? (progress > 0 && progress < 1 ? `Uploading… ${Math.round(progress * 100)}%` : "Submitting…") : banner?.retry ? "Try again" : "Submit application"}
          </button>
          <p className="m-0 text-sm leading-snug font-light text-ink/50">
            Questions marked <span className="text-ember">*</span> are required.
          </p>
        </div>
        {sending && (
          <div className="mt-4 h-1.5 max-w-sm overflow-hidden rounded-full bg-black/5" aria-hidden>
            <div className="h-full bg-brand transition-[width] duration-200" style={{ width: `${Math.max(5, progress * 100)}%` }} />
          </div>
        )}
      </form>
    </div>
  );
}
