"use client";

import { useCallback, useEffect, useState } from "react";
import type { Navigate } from "./admin-app";
import { api, ApiError, formatDate, timeAgo, type FormSummary } from "./_lib/api";
import { adminInput, Badge, Button, Card, Label, Modal, Spinner, useUi } from "./_components/ui";

export function publicFormUrl(slug: string) {
  return `${typeof window === "undefined" ? "" : window.location.origin}/volunteer?f=${encodeURIComponent(slug)}`;
}

export function FormStatusBadge({ isOpen, acceptingResponses }: { isOpen: boolean; acceptingResponses: boolean }) {
  if (acceptingResponses) return <Badge tone="green">● Open</Badge>;
  if (isOpen) return <Badge tone="amber">Deadline passed</Badge>;
  return <Badge>Closed</Badge>;
}

export function FormsList({ navigate }: { navigate: Navigate }) {
  const [forms, setForms] = useState<FormSummary[] | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const { toast, confirm } = useUi();

  const load = useCallback(
    () =>
      api<{ forms: FormSummary[] }>("/forms").then(
        ({ forms }) => {
          setForms(forms);
          setError("");
        },
        (e: Error) => setError(e.message),
      ),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleOpen(form: FormSummary) {
    const opening = !form.isOpen;
    const ok = await confirm({
      title: opening ? "Open this form?" : "Close this form?",
      message: opening
        ? `"${form.title}" will start taking responses at ${publicFormUrl(form.slug)} and show on the /volunteer page.`
        : `"${form.title}" will stop taking responses. People who have it open will see the closed message when they submit.`,
      confirmLabel: opening ? "Open form" : "Close form",
    });
    if (!ok) return;
    setBusy(form.id);
    try {
      await api(`/forms/${form.id}`, { method: "PATCH", body: { isOpen: opening } });
      toast(opening ? "Form is open" : "Form is closed");
      await load();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl leading-tight font-semibold tracking-tight">Forms</h1>
          <p className="m-0 mt-1 text-sm text-ink/55">Volunteer calls and other forms. Open forms are listed on the site&apos;s /volunteer page.</p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          + New form
        </Button>
      </div>

      {error && (
        <Card className="mb-4 flex items-center justify-between gap-4 p-4 text-sm text-red-700">
          {error}
          <Button size="sm" onClick={load}>
            Retry
          </Button>
        </Card>
      )}

      {!forms && !error && (
        <div className="flex items-center gap-3 py-12 text-ink/55">
          <Spinner /> Loading forms…
        </div>
      )}

      {forms && forms.length === 0 && (
        <Card className="px-6 py-14 text-center">
          <p className="m-0 text-lg font-medium">No forms yet</p>
          <p className="mx-auto mt-2 mb-6 max-w-sm text-sm text-ink/60">Start from the 2026/27 volunteering form and adjust it, or build one from scratch.</p>
          <Button variant="primary" onClick={() => setCreating(true)}>
            Create your first form
          </Button>
        </Card>
      )}

      {forms && forms.length > 0 && (
        <div className="grid gap-3">
          {forms.map((form) => {
            const newCount = form.responses.byStatus.new ?? 0;
            return (
              <Card key={form.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4 sm:p-5">
                <div className="min-w-[240px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate({ form: form.id, tab: "responses" })}
                      className="cursor-pointer text-left text-base leading-snug font-semibold hover:text-ember"
                    >
                      {form.title}
                    </button>
                    <FormStatusBadge isOpen={form.isOpen} acceptingResponses={form.acceptingResponses} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-[13px] text-ink/50">
                    <a href={publicFormUrl(form.slug)} target="_blank" rel="noopener noreferrer" className="font-mono hover:text-ink">
                      /volunteer?f={form.slug}
                    </a>
                    {form.closesAt && <span>Closes {formatDate(form.closesAt)}</span>}
                    <span>
                      Edited {timeAgo(form.updatedAt)}
                      {form.updatedBy && ` by ${form.updatedBy}`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate({ form: form.id, tab: "responses" })}
                  className="cursor-pointer text-right hover:text-ember"
                >
                  <span className="block text-xl leading-none font-semibold tabular-nums">{form.responses.total}</span>
                  <span className="text-[13px] text-ink/50">
                    responses{newCount > 0 && <span className="font-medium text-sky-700"> · {newCount} new</span>}
                  </span>
                </button>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => navigate({ form: form.id, tab: "responses" })}>
                    Responses
                  </Button>
                  <Button size="sm" onClick={() => navigate({ form: form.id, tab: "edit" })}>
                    Edit
                  </Button>
                  <Button size="sm" variant={form.isOpen ? "secondary" : "primary"} disabled={busy === form.id} onClick={() => toggleOpen(form)}>
                    {busy === form.id ? <Spinner /> : form.isOpen ? "Close" : "Open"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <NewFormDialog
        open={creating}
        forms={forms ?? []}
        onClose={() => setCreating(false)}
        onCreated={(id) => {
          setCreating(false);
          toast("Form created. It stays closed until you open it.");
          navigate({ form: id, tab: "edit" });
        }}
      />
    </>
  );
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

function NewFormDialog({ open, forms, onClose, onCreated }: { open: boolean; forms: FormSummary[]; onClose: () => void; onCreated: (id: string) => void }) {
  const [title, setTitle] = useState("Volunteering Form 2026/27");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [from, setFrom] = useState("volunteer");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const effectiveSlug = slugTouched ? slug : slugify(title);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { id } = await api<{ id: string }>("/forms", { method: "POST", body: { title, slug: effectiveSlug, from } });
      onCreated(id);
      setSlugTouched(false);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New form">
      <form onSubmit={create} className="grid gap-4">
        <div>
          <Label htmlFor="new-title">Title</Label>
          <input id="new-title" className={adminInput} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
        </div>
        <div>
          <Label htmlFor="new-slug" hint="Lowercase letters, numbers and dashes. Used in the form's link.">
            Link name
          </Label>
          <div className="flex items-center rounded-lg border border-black/15 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25">
            <span className="pl-3 text-sm text-ink/40">/volunteer?f=</span>
            <input
              id="new-slug"
              className="w-full bg-transparent py-2 pr-3 font-mono text-sm outline-none"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value) + (e.target.value.endsWith("-") ? "-" : ""));
              }}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="new-from">Start from</Label>
          <select id="new-from" className={adminInput} value={from} onChange={(e) => setFrom(e.target.value)}>
            <option value="volunteer">Volunteering form template (2026/27)</option>
            <option value="blank">Blank form</option>
            {forms.length > 0 && (
              <optgroup label="Copy an existing form">
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
        {error && <p className="m-0 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving || !title.trim() || !effectiveSlug}>
            {saving ? <Spinner /> : "Create form"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
