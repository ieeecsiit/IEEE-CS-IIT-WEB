"use client";

import { useCallback, useEffect, useState } from "react";
import { FormRenderer } from "@/app/_components/forms/form-renderer";
import { RichText } from "@/app/_components/forms/rich-text";
import {
  allFields,
  FIELD_TYPE_LABELS,
  FIELD_TYPES,
  FILE_KIND_LABELS,
  FILE_KINDS,
  isChoice,
  MAX_FILE_MB,
  newId,
  sanitizeDefinition,
  type Answers,
  type FieldType,
  type FormDefinition,
  type FormField,
} from "@/shared/forms";
import type { Navigate } from "./admin-app";
import { FormStatusBadge, publicFormUrl } from "./forms-list";
import { api, ApiError, timeAgo, type AdminForm } from "./_lib/api";
import { adminInput, Button, Card, Label, Spinner, useUi } from "./_components/ui";

type Draft = { slug: string; definition: FormDefinition };

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export function FormEditor({ formId, navigate }: { formId: string; navigate: Navigate }) {
  const { toast, confirm } = useUi();
  const [form, setForm] = useState<AdminForm | null>(null);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(
    () =>
      api<{ form: AdminForm }>(`/forms/${formId}`).then(
        ({ form }) => {
          const next = { slug: form.slug, definition: form.definition };
          setForm(form);
          setDraft(next);
          setSaved(JSON.stringify(next));
          setSaveError("");
          setLoadError("");
        },
        (e: Error) => setLoadError(e.message),
      ),
    [formId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = draft !== null && JSON.stringify(draft) !== saved;

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const problem = draft ? sanitizeDefinition(draft.definition).error : undefined;

  const update = (change: (definition: FormDefinition) => void) =>
    setDraft((current) => {
      if (!current) return current;
      const definition = structuredClone(current.definition);
      change(definition);
      return { ...current, definition };
    });

  async function save() {
    if (!draft || !form) return;
    setSaving(true);
    setSaveError("");
    try {
      const { form: updated } = await api<{ form: AdminForm }>(`/forms/${form.id}`, {
        method: "PUT",
        body: { definition: draft.definition, slug: draft.slug, baseVersion: form.version },
      });
      const next = { slug: updated.slug, definition: updated.definition };
      setForm(updated);
      setDraft(next);
      setSaved(JSON.stringify(next));
      toast(updated.isOpen ? "Saved. The live form is updated." : "Saved.");
    } catch (e) {
      const error = e as ApiError;
      setSaveError(error.message);
      if (error.data.conflict) {
        const reload = await confirm({
          title: "Someone else changed this form",
          message: `${error.message} Reloading discards your unsaved changes here. Copy anything you need first.`,
          confirmLabel: "Reload their version",
          danger: true,
        });
        if (reload) await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function leave(to: Parameters<Navigate>[0]) {
    if (dirty && !(await confirm({ title: "Discard unsaved changes?", message: "Your edits to this form haven't been saved.", confirmLabel: "Discard", danger: true }))) {
      return;
    }
    navigate(to);
  }

  async function toggleOpen() {
    if (!form) return;
    const opening = !form.isOpen;
    if (opening && dirty) {
      toast("Save your changes before opening the form.", "error");
      return;
    }
    const ok = await confirm({
      title: opening ? "Open this form?" : "Close this form?",
      message: opening ? `It will start taking responses at ${publicFormUrl(form.slug)}.` : "It will stop taking responses.",
      confirmLabel: opening ? "Open form" : "Close form",
    });
    if (!ok) return;
    setToggling(true);
    try {
      const { form: updated } = await api<{ form: AdminForm }>(`/forms/${form.id}`, { method: "PATCH", body: { isOpen: opening } });
      setForm((current) => (current ? { ...current, isOpen: updated.isOpen, acceptingResponses: updated.acceptingResponses } : current));
      toast(opening ? "Form is open" : "Form is closed");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setToggling(false);
    }
  }

  async function deleteForm() {
    if (!form) return;
    const ok = await confirm({
      title: "Delete this form?",
      message: (
        <>
          This permanently deletes <strong>{form.definition.settings.title}</strong>, every response to it and every uploaded file. Export the responses
          first if you need them. This can&apos;t be undone.
        </>
      ),
      confirmLabel: "Delete forever",
      danger: true,
      typeToConfirm: form.slug,
    });
    if (!ok) return;
    try {
      await api(`/forms/${form.id}`, { method: "DELETE", body: { confirmSlug: form.slug } });
      setSaved(JSON.stringify(draft)); // nothing left to lose
      toast("Form deleted");
      navigate({});
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  if (loadError) {
    return (
      <Card className="flex items-center justify-between gap-4 p-4 text-sm text-red-700">
        {loadError}
        <Button size="sm" onClick={load}>
          Retry
        </Button>
      </Card>
    );
  }
  if (!form || !draft) {
    return (
      <div className="flex items-center gap-3 py-12 text-ink/55">
        <Spinner /> Loading form…
      </div>
    );
  }

  const { settings, sections } = draft.definition;
  const fields = allFields(draft.definition);

  return (
    <>
      {/* Header */}
      <div className="sticky top-14 z-40 -mx-4 mb-6 border-b border-black/[0.06] bg-[#f6f5f3]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => leave({})} className="cursor-pointer text-sm text-ink/55 hover:text-ink">
            ← Forms
          </button>
          <h1 className="m-0 min-w-0 truncate text-lg leading-tight font-semibold">{settings.title || "Untitled form"}</h1>
          <FormStatusBadge isOpen={form.isOpen} acceptingResponses={form.acceptingResponses} />
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-ink/50 max-md:hidden">
              {dirty ? "Unsaved changes" : `v${form.version} saved ${timeAgo(form.updatedAt)}${form.updatedBy ? ` by ${form.updatedBy}` : ""}`}
            </span>
            <Button size="sm" variant="ghost" onClick={() => leave({ form: form.id, tab: "responses" })}>
              Responses
            </Button>
            <Button size="sm" onClick={() => setShowPreview((v) => !v)} className="max-[1180px]:hidden">
              {showPreview ? "Hide preview" : "Show preview"}
            </Button>
            <Button size="sm" onClick={toggleOpen} disabled={toggling}>
              {form.isOpen ? "Close form" : "Open form"}
            </Button>
            {dirty && (
              <Button size="sm" variant="ghost" onClick={() => setDraft(JSON.parse(saved))}>
                Discard
              </Button>
            )}
            <Button size="sm" variant="primary" onClick={save} disabled={!dirty || saving || !!problem}>
              {saving ? <Spinner /> : "Save"}
            </Button>
          </div>
        </div>
        {(problem || saveError) && dirty && <p className="m-0 mt-2 text-[13px] text-red-700">{saveError || problem}</p>}
      </div>

      <div className={`grid items-start gap-6 ${showPreview ? "min-[1180px]:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]" : ""}`}>
        <div className="grid gap-5">
          {/* Settings */}
          <Card className="grid gap-4 p-5">
            <h2 className="m-0 text-base font-semibold">Form details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="title">Title</Label>
                <input id="title" className={adminInput} value={settings.title} maxLength={200} onChange={(e) => update((d) => void (d.settings.title = e.target.value))} />
              </div>
              <div>
                <Label htmlFor="slug" hint={form.isOpen ? "Changing it breaks links you've already shared." : undefined}>
                  Link name
                </Label>
                <input
                  id="slug"
                  className={`${adminInput} font-mono`}
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="intro" hint='Shown beside the form. Leave a blank line between paragraphs; start a line with "- " for a bullet. Links work.'>
                Introduction
              </Label>
              <textarea
                id="intro"
                rows={8}
                className={`${adminInput} resize-y`}
                value={settings.intro}
                onChange={(e) => update((d) => void (d.settings.intro = e.target.value))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="success">Message after submitting</Label>
                <textarea
                  id="success"
                  rows={3}
                  className={`${adminInput} resize-y`}
                  value={settings.successMessage}
                  onChange={(e) => update((d) => void (d.settings.successMessage = e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="closed">Message when closed</Label>
                <textarea
                  id="closed"
                  rows={3}
                  className={`${adminInput} resize-y`}
                  value={settings.closedMessage}
                  onChange={(e) => update((d) => void (d.settings.closedMessage = e.target.value))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="closes" hint="Optional. The form stops taking responses at this time (your timezone).">
                  Deadline
                </Label>
                <input
                  id="closes"
                  type="datetime-local"
                  className={adminInput}
                  value={toLocalInput(settings.closesAt)}
                  onChange={(e) => update((d) => void (d.settings.closesAt = e.target.value ? new Date(e.target.value).toISOString() : null))}
                />
              </div>
              <div>
                <Label htmlFor="unique" hint="Stops the same person applying twice.">
                  One response per
                </Label>
                <select
                  id="unique"
                  className={adminInput}
                  value={settings.uniqueFieldId ?? ""}
                  onChange={(e) => update((d) => void (d.settings.uniqueFieldId = e.target.value || null))}
                >
                  <option value="">Allow any number of responses</option>
                  {fields
                    .filter((f) => ["short_text", "email", "phone"].includes(f.type))
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Sections and questions */}
          {sections.map((section, sectionIndex) => (
            <Card key={section.id} className="p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="grid flex-1 gap-2">
                  <input
                    aria-label="Section title"
                    placeholder={`Section ${sectionIndex + 1} title (optional)`}
                    className={`${adminInput} text-base font-semibold`}
                    value={section.title}
                    onChange={(e) => update((d) => void (d.sections[sectionIndex].title = e.target.value))}
                  />
                  <input
                    aria-label="Section description"
                    placeholder="Description (optional)"
                    className={adminInput}
                    value={section.description ?? ""}
                    onChange={(e) => update((d) => void (d.sections[sectionIndex].description = e.target.value))}
                  />
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" aria-label="Move section up" disabled={sectionIndex === 0} onClick={() => update((d) => moveItem(d.sections, sectionIndex, -1))}>
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Move section down"
                    disabled={sectionIndex === sections.length - 1}
                    onClick={() => update((d) => moveItem(d.sections, sectionIndex, 1))}
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Delete section"
                    disabled={sections.length === 1}
                    onClick={async () => {
                      const ok =
                        section.fields.length === 0 ||
                        (await confirm({
                          title: "Delete this section?",
                          message: `Its ${section.fields.length} question(s) will be removed. Answers already collected stay in Responses.`,
                          confirmLabel: "Delete section",
                          danger: true,
                        }));
                      if (ok) update((d) => void d.sections.splice(sectionIndex, 1));
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                {section.fields.map((field, fieldIndex) => (
                  <FieldEditor
                    key={field.id}
                    field={field}
                    expanded={expanded === field.id}
                    onToggle={() => setExpanded(expanded === field.id ? null : field.id)}
                    earlierChoiceFields={fields.slice(0, fields.findIndex((f) => f.id === field.id)).filter((f) => isChoice(f.type))}
                    onChange={(next) => update((d) => void (d.sections[sectionIndex].fields[fieldIndex] = next))}
                    onMove={(delta) => update((d) => moveField(d, sectionIndex, fieldIndex, delta))}
                    canMoveUp={sectionIndex > 0 || fieldIndex > 0}
                    canMoveDown={sectionIndex < sections.length - 1 || fieldIndex < section.fields.length - 1}
                    onDuplicate={() => {
                      const copy = { ...structuredClone(field), id: newId("f_"), label: `${field.label} (copy)` };
                      update((d) => void d.sections[sectionIndex].fields.splice(fieldIndex + 1, 0, copy));
                      setExpanded(copy.id);
                    }}
                    onDelete={async () => {
                      const dependants = fields.filter((f) => f.showIf?.fieldId === field.id);
                      const ok = await confirm({
                        title: "Delete this question?",
                        message: (
                          <>
                            &ldquo;{field.label}&rdquo; will be removed from the form. Answers already collected stay in Responses, marked as removed.
                            {dependants.length > 0 && <> {dependants.length} question(s) that depend on it will always be shown instead.</>}
                          </>
                        ),
                        confirmLabel: "Delete question",
                        danger: true,
                      });
                      if (!ok) return;
                      update((d) => {
                        d.sections[sectionIndex].fields.splice(fieldIndex, 1);
                        for (const f of allFields(d)) if (f.showIf?.fieldId === field.id) delete f.showIf;
                        if (d.settings.uniqueFieldId === field.id) d.settings.uniqueFieldId = null;
                      });
                    }}
                  />
                ))}
              </div>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => {
                  const field: FormField = { id: newId("f_"), type: "short_text", label: "", required: false };
                  update((d) => void d.sections[sectionIndex].fields.push(field));
                  setExpanded(field.id);
                }}
              >
                + Add question
              </Button>
            </Card>
          ))}

          <Button onClick={() => update((d) => void d.sections.push({ id: newId("s_"), title: "", fields: [] }))} className="justify-self-start">
            + Add section
          </Button>

          <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 p-5 ring-red-200">
            <div>
              <h2 className="m-0 text-sm font-semibold text-red-700">Delete form</h2>
              <p className="m-0 mt-1 text-[13px] text-ink/55">Removes the form, all of its responses and uploaded files for good.</p>
            </div>
            <Button size="sm" variant="danger" onClick={deleteForm}>
              Delete form…
            </Button>
          </Card>
        </div>

        {showPreview && (
          <div className="sticky top-32 max-[1180px]:hidden">
            <Preview definition={draft.definition} />
          </div>
        )}
      </div>
    </>
  );
}

function Preview({ definition }: { definition: FormDefinition }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  return (
    <Card className="max-h-[calc(100vh-10rem)] overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.06] bg-white/95 px-5 py-2.5 backdrop-blur">
        <span className="text-[13px] font-medium text-ink/55">Live preview (answers here aren&apos;t saved)</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setAnswers({});
            setFiles({});
          }}
        >
          Reset
        </Button>
      </div>
      <div className="p-6">
        <h2 className="m-0 text-2xl leading-tight font-medium tracking-tight">{definition.settings.title}</h2>
        {definition.settings.intro && <RichText text={definition.settings.intro} className="mt-4 mb-8 text-sm leading-relaxed text-ink/70" />}
        <FormRenderer
          definition={definition}
          answers={answers}
          files={files}
          errors={{}}
          onAnswer={(id, value) => setAnswers((a) => ({ ...a, [id]: value }))}
          onFile={(id, file) => setFiles((f) => ({ ...f, [id]: file }))}
        />
      </div>
    </Card>
  );
}

function moveItem<T>(list: T[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
}

/** Moves a question up or down, across into the neighbouring section at the edges. */
function moveField(definition: FormDefinition, sectionIndex: number, fieldIndex: number, delta: number) {
  const section = definition.sections[sectionIndex];
  const target = fieldIndex + delta;
  if (target >= 0 && target < section.fields.length) return moveItem(section.fields, fieldIndex, delta);
  const neighbour = definition.sections[sectionIndex + delta];
  if (!neighbour) return;
  const [field] = section.fields.splice(fieldIndex, 1);
  if (delta < 0) neighbour.fields.push(field);
  else neighbour.fields.unshift(field);
}

type FieldEditorProps = {
  field: FormField;
  expanded: boolean;
  onToggle: () => void;
  earlierChoiceFields: FormField[];
  onChange: (field: FormField) => void;
  onMove: (delta: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
};

function FieldEditor({ field, expanded, onToggle, earlierChoiceFields, onChange, onMove, canMoveUp, canMoveDown, onDuplicate, onDelete }: FieldEditorProps) {
  const set = (patch: Partial<FormField>) => onChange({ ...field, ...patch });
  const condition = field.showIf ? earlierChoiceFields.find((f) => f.id === field.showIf!.fieldId) : undefined;

  const changeType = (type: FieldType) => {
    const next: FormField = { id: field.id, type, label: field.label, required: field.required, help: field.help, showIf: field.showIf };
    if (isChoice(type)) {
      next.options = field.options?.length ? field.options : ["Option 1", "Option 2"];
      next.allowOther = field.allowOther;
    }
    if (type === "file") {
      next.accept = ["image", "pdf", "document"];
      next.maxSizeMB = MAX_FILE_MB;
    }
    if (["short_text", "long_text", "email", "phone", "number"].includes(type)) next.placeholder = field.placeholder;
    onChange(next);
  };

  return (
    <div className={`rounded-lg ring-1 transition-colors ${expanded ? "bg-white ring-brand/60" : "bg-black/[0.015] ring-black/[0.08] hover:ring-black/20"}`}>
      <div className="flex items-center gap-2 px-3 py-2">
        <button type="button" onClick={onToggle} aria-expanded={expanded} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-1 text-left">
          <span className="w-4 shrink-0 text-ink/35">{expanded ? "▾" : "▸"}</span>
          <span className="min-w-0 flex-1">
            <span className={`block truncate text-sm font-medium ${field.label ? "" : "text-ink/40 italic"}`}>
              {field.label || "Untitled question"}
              {field.required && <span className="text-ember"> *</span>}
            </span>
            <span className="block truncate text-[12px] text-ink/45">
              {FIELD_TYPE_LABELS[field.type]}
              {condition && ` · only if "${condition.label}" is ${field.showIf!.anyOf.length === 1 ? `"${field.showIf!.anyOf[0]}"` : `one of ${field.showIf!.anyOf.length}`}`}
            </span>
          </span>
        </button>
        <Button size="sm" variant="ghost" aria-label="Move up" disabled={!canMoveUp} onClick={() => onMove(-1)}>
          ↑
        </Button>
        <Button size="sm" variant="ghost" aria-label="Move down" disabled={!canMoveDown} onClick={() => onMove(1)}>
          ↓
        </Button>
      </div>

      {expanded && (
        <div className="grid gap-4 border-t border-black/[0.06] px-4 pt-4 pb-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
            <div>
              <Label htmlFor={`${field.id}-label`}>Question</Label>
              <input id={`${field.id}-label`} autoFocus={!field.label} className={adminInput} value={field.label} onChange={(e) => set({ label: e.target.value })} />
            </div>
            <div>
              <Label htmlFor={`${field.id}-type`}>Type</Label>
              <select id={`${field.id}-type`} className={adminInput} value={field.type} onChange={(e) => changeType(e.target.value as FieldType)}>
                {FIELD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {FIELD_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor={`${field.id}-help`}>Help text (optional)</Label>
            <input id={`${field.id}-help`} className={adminInput} value={field.help ?? ""} onChange={(e) => set({ help: e.target.value })} />
          </div>

          {isChoice(field.type) && (
            <div>
              <Label htmlFor={`${field.id}-options`} hint="One option per line.">
                Options
              </Label>
              <textarea
                id={`${field.id}-options`}
                rows={Math.min(10, Math.max(3, (field.options?.length ?? 0) + 1))}
                className={`${adminInput} resize-y`}
                value={(field.options ?? []).join("\n")}
                onChange={(e) => set({ options: e.target.value.split("\n") })}
              />
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!field.allowOther} onChange={(e) => set({ allowOther: e.target.checked })} className="size-4 accent-[var(--color-ember)]" />
                Add an &ldquo;Other&rdquo; option with a text box
              </label>
            </div>
          )}

          {["short_text", "long_text", "email", "phone", "number"].includes(field.type) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`${field.id}-placeholder`}>Placeholder (optional)</Label>
                <input id={`${field.id}-placeholder`} className={adminInput} value={field.placeholder ?? ""} onChange={(e) => set({ placeholder: e.target.value })} />
              </div>
              {field.type === "email" && (
                <div>
                  <Label htmlFor={`${field.id}-domain`} hint="Optional. For example iit.ac.lk">
                    Only accept emails at
                  </Label>
                  <input
                    id={`${field.id}-domain`}
                    className={adminInput}
                    value={field.emailDomain ?? ""}
                    placeholder="iit.ac.lk"
                    onChange={(e) => set({ emailDomain: e.target.value.trim() || undefined })}
                  />
                </div>
              )}
              {(field.type === "short_text" || field.type === "long_text") && (
                <div>
                  <Label htmlFor={`${field.id}-max`}>Max length (characters, optional)</Label>
                  <input
                    id={`${field.id}-max`}
                    type="number"
                    min={1}
                    className={adminInput}
                    value={field.maxLength ?? ""}
                    onChange={(e) => set({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              )}
            </div>
          )}

          {field.type === "file" && (
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <fieldset className="m-0 border-0 p-0">
                <legend className="mb-1.5 text-[13px] font-medium text-ink/80">Accepted files</legend>
                <div className="grid gap-1.5">
                  {FILE_KINDS.map((kind) => (
                    <label key={kind} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 accent-[var(--color-ember)]"
                        checked={field.accept?.includes(kind) ?? false}
                        onChange={(e) => {
                          const accept = new Set(field.accept ?? []);
                          if (e.target.checked) accept.add(kind);
                          else accept.delete(kind);
                          set({ accept: FILE_KINDS.filter((k) => accept.has(k)) });
                        }}
                      />
                      {FILE_KIND_LABELS[kind]}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <Label htmlFor={`${field.id}-size`}>Max size (MB)</Label>
                <input
                  id={`${field.id}-size`}
                  type="number"
                  min={1}
                  max={MAX_FILE_MB}
                  className={adminInput}
                  value={field.maxSizeMB ?? MAX_FILE_MB}
                  onChange={(e) => set({ maxSizeMB: Math.min(MAX_FILE_MB, Math.max(1, Number(e.target.value) || 1)) })}
                />
              </div>
            </div>
          )}

          {/* Condition */}
          <div className="rounded-lg bg-black/[0.025] p-3">
            <Label htmlFor={`${field.id}-cond`} hint="Show this question only for certain answers to an earlier choice question.">
              Show this question
            </Label>
            <select
              id={`${field.id}-cond`}
              className={adminInput}
              value={field.showIf?.fieldId ?? ""}
              onChange={(e) => set({ showIf: e.target.value ? { fieldId: e.target.value, anyOf: [] } : null })}
            >
              <option value="">Always</option>
              {earlierChoiceFields.map((f) => (
                <option key={f.id} value={f.id}>
                  Only if &ldquo;{f.label}&rdquo; is…
                </option>
              ))}
            </select>
            {condition && (
              <div className="mt-2 grid gap-1.5">
                {(condition.options ?? []).map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--color-ember)]"
                      checked={field.showIf!.anyOf.includes(option)}
                      onChange={(e) =>
                        set({
                          showIf: {
                            fieldId: condition.id,
                            anyOf: e.target.checked ? [...field.showIf!.anyOf, option] : field.showIf!.anyOf.filter((o) => o !== option),
                          },
                        })
                      }
                    />
                    {option}
                  </label>
                ))}
                {field.showIf!.anyOf.length === 0 && <p className="m-0 text-[12px] text-amber-700">Tick at least one answer, or the condition is ignored.</p>}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={field.required} onChange={(e) => set({ required: e.target.checked })} className="size-4 accent-[var(--color-ember)]" />
              Required
            </label>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={onDuplicate}>
                Duplicate
              </Button>
              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={onDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
