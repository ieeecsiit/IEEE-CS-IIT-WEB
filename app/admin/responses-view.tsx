"use client";

import { useCallback, useEffect, useState } from "react";
import { fieldsForVersion, isChoice, OTHER_PREFIX, responseColumns, type FormDefinition, type FormField } from "@/shared/forms";
import type { Navigate } from "./admin-app";
import { FormStatusBadge, publicFormUrl } from "./forms-list";
import { api, fileUrl, formatDate, STATUS_LABELS, STATUSES, timeAgo, type AdminForm, type AdminResponse, type ResponseStatus } from "./_lib/api";
import { adminInput, Badge, Button, Card, Spinner, STATUS_TONES, useUi } from "./_components/ui";
import { formatBytes } from "@/app/_components/forms/form-renderer";

type Data = { form: AdminForm; versions: Record<number, FormDefinition>; responses: AdminResponse[] };

const answerText = (value: string | string[] | undefined) => (Array.isArray(value) ? value.join(", ") : (value ?? ""));

export function ResponsesView({ formId, navigate }: { formId: string; navigate: Navigate }) {
  const { toast } = useUi();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ResponseStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [breakdownField, setBreakdownField] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api<Data>(`/forms/${formId}/responses`).then(
        (result) => {
          setData(result);
          setError("");
          setLoading(false);
        },
        (e: Error) => {
          setError(e.message);
          setLoading(false);
        },
      ),
    [formId],
  );
  const refresh = () => {
    setLoading(true);
    void load();
  };

  useEffect(() => {
    void load();
  }, [load]);

  const columns = data ? responseColumns(data.form.definition, data.versions) : [];
  const choiceColumns = columns.filter((c) => isChoice(c.type));
  const nameColumn = columns.find((c) => c.type === "short_text");
  const emailColumn = columns.find((c) => c.type === "email");
  const highlightColumn = choiceColumns.find((c) => c.type === "multi_choice") ?? choiceColumns[0];
  const breakdown = choiceColumns.find((c) => c.id === breakdownField) ?? highlightColumn;
  const filterColumn = choiceColumns.find((c) => c.id === filterField);

  const counts = (() => {
    const result: Record<string, number> = { all: data?.responses.length ?? 0 };
    for (const r of data?.responses ?? []) result[r.status] = (result[r.status] ?? 0) + 1;
    return result;
  })();

  const filtered = (() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();
    return data.responses.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (filterColumn && filterValue) {
        const answer = r.answers[filterColumn.id];
        const values = Array.isArray(answer) ? answer : answer ? [answer] : [];
        const match = filterValue === OTHER_PREFIX ? values.some((v) => v.startsWith(OTHER_PREFIX)) : values.includes(filterValue);
        if (!match) return false;
      }
      if (query) {
        const haystack = [...Object.values(r.answers).map(answerText), r.notes].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  })();

  const breakdownCounts = (() => {
    if (!breakdown) return [];
    const tally = new Map<string, number>((breakdown.options ?? []).map((o) => [o, 0]));
    for (const r of filtered) {
      const answer = r.answers[breakdown.id];
      for (const value of Array.isArray(answer) ? answer : answer ? [answer] : []) {
        const key = value.startsWith(OTHER_PREFIX) ? "Other" : value;
        tally.set(key, (tally.get(key) ?? 0) + 1);
      }
    }
    return [...tally.entries()];
  })();

  const replace = (response: AdminResponse) =>
    setData((d) => (d ? { ...d, responses: d.responses.map((r) => (r.id === response.id ? response : r)) } : d));
  const remove = (id: string) => setData((d) => (d ? { ...d, responses: d.responses.filter((r) => r.id !== id) } : d));

  if (error && !data) {
    return (
      <Card className="flex items-center justify-between gap-4 p-4 text-sm text-red-700">
        {error}
        <Button size="sm" onClick={refresh}>
          Retry
        </Button>
      </Card>
    );
  }
  if (!data) {
    return (
      <div className="flex items-center gap-3 py-12 text-ink/55">
        <Spinner /> Loading responses…
      </div>
    );
  }

  const { form } = data;
  const selectedIndex = filtered.findIndex((r) => r.id === selected);
  const selectedResponse = selectedIndex >= 0 ? filtered[selectedIndex] : data.responses.find((r) => r.id === selected);
  const maxCount = Math.max(1, ...breakdownCounts.map(([, n]) => n));
  const exportHref = `/api/admin/forms/${form.id}/export${status !== "all" ? `?status=${status}` : ""}`;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => navigate({})} className="cursor-pointer text-sm text-ink/55 hover:text-ink">
          ← Forms
        </button>
        <h1 className="m-0 text-xl leading-tight font-semibold tracking-tight">{form.definition.settings.title}</h1>
        <FormStatusBadge isOpen={form.isOpen} acceptingResponses={form.acceptingResponses} />
        <a href={publicFormUrl(form.slug)} target="_blank" rel="noopener noreferrer" className="font-mono text-[13px] text-ink/45 hover:text-ink">
          /volunteer?f={form.slug} ↗
        </a>
        <div className="ml-auto flex gap-2">
          <Button size="sm" onClick={refresh} disabled={loading}>
            {loading ? <Spinner /> : "Refresh"}
          </Button>
          <a href={exportHref} className="inline-flex h-8 items-center rounded-lg bg-white px-3 text-[13px] font-medium ring-1 ring-black/12 hover:bg-black/[0.03]">
            Export CSV{status !== "all" ? ` (${STATUS_LABELS[status]})` : ""}
          </a>
          <Button size="sm" variant="primary" onClick={() => navigate({ form: form.id, tab: "edit" })}>
            Edit form
          </Button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              status === s ? "bg-ink text-white" : "bg-white text-ink/65 ring-1 ring-black/10 hover:text-ink"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]} <span className="tabular-nums opacity-60">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {/* Filters */}
          <div className="mb-3 flex flex-wrap gap-2">
            <input
              type="search"
              placeholder="Search answers and notes…"
              className={`${adminInput} max-w-xs`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {choiceColumns.length > 0 && (
              <>
                <select
                  aria-label="Filter by question"
                  className={`${adminInput} w-auto max-w-[240px]`}
                  value={filterField}
                  onChange={(e) => {
                    setFilterField(e.target.value);
                    setFilterValue("");
                  }}
                >
                  <option value="">Filter by answer…</option>
                  {choiceColumns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {filterColumn && (
                  <select aria-label="Answer" className={`${adminInput} w-auto max-w-[280px]`} value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
                    <option value="">Any answer</option>
                    {filterColumn.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                    {filterColumn.allowOther && <option value={OTHER_PREFIX}>Other</option>}
                  </select>
                )}
              </>
            )}
          </div>

          <Card className="overflow-x-auto">
            {filtered.length === 0 ? (
              <p className="m-0 px-6 py-14 text-center text-sm text-ink/55">
                {data.responses.length === 0 ? "No responses yet." : "No responses match these filters."}
              </p>
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-black/[0.08] text-[12px] tracking-wide text-ink/50 uppercase">
                    <th className="px-4 py-2.5 font-medium">{nameColumn?.label ?? "Response"}</th>
                    {emailColumn && <th className="px-4 py-2.5 font-medium max-md:hidden">{emailColumn.label}</th>}
                    {highlightColumn && <th className="px-4 py-2.5 font-medium max-xl:hidden">{highlightColumn.label}</th>}
                    <th className="px-4 py-2.5 font-medium">Submitted</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r.id)}
                      className={`cursor-pointer border-b border-black/[0.05] last:border-0 hover:bg-glow/30 ${selected === r.id ? "bg-glow/40" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <button type="button" className="cursor-pointer text-left font-medium" onClick={() => setSelected(r.id)}>
                          {(nameColumn && answerText(r.answers[nameColumn.id])) || "(no name)"}
                        </button>
                        {r.notes && <span className="ml-2 text-[12px] text-ink/40" title={r.notes}>📝</span>}
                      </td>
                      {emailColumn && <td className="px-4 py-3 text-ink/70 max-md:hidden">{answerText(r.answers[emailColumn.id])}</td>}
                      {highlightColumn && (
                        <td className="max-w-[320px] truncate px-4 py-3 text-ink/70 max-xl:hidden">{answerText(r.answers[highlightColumn.id])}</td>
                      )}
                      <td className="px-4 py-3 whitespace-nowrap text-ink/60" title={formatDate(r.createdAt)}>
                        {timeAgo(r.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
          <p className="mt-2 text-[12px] text-ink/45">
            Showing {filtered.length} of {data.responses.length}
          </p>
        </div>

        {/* Breakdown */}
        {breakdown && (
          <Card className="p-4 md:sticky md:top-20">
            <select aria-label="Breakdown question" className={`${adminInput} mb-3 font-medium`} value={breakdown.id} onChange={(e) => setBreakdownField(e.target.value)}>
              {choiceColumns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="m-0 mb-3 text-[12px] text-ink/50">Of the {filtered.length} responses shown. Click a row to filter.</p>
            <div className="grid gap-2.5">
              {breakdownCounts.map(([option, n]) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setFilterField(breakdown.id);
                    setFilterValue(option === "Other" && !breakdown.options?.includes("Other") ? OTHER_PREFIX : option);
                  }}
                  className="group cursor-pointer text-left"
                >
                  <span className="flex justify-between gap-3 text-[13px] leading-snug">
                    <span className="text-ink/80 group-hover:text-ink">{option}</span>
                    <span className="font-medium tabular-nums">{n}</span>
                  </span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${(n / maxCount) * 100}%` }} />
                  </span>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {selectedResponse && (
        <ResponseDrawer
          key={selectedResponse.id}
          response={selectedResponse}
          fields={fieldsForVersion(data.versions, selectedResponse.formVersion, form.definition)}
          allColumns={columns}
          position={selectedIndex >= 0 ? `${selectedIndex + 1} of ${filtered.length}` : ""}
          onPrev={selectedIndex > 0 ? () => setSelected(filtered[selectedIndex - 1].id) : undefined}
          onNext={selectedIndex >= 0 && selectedIndex < filtered.length - 1 ? () => setSelected(filtered[selectedIndex + 1].id) : undefined}
          onClose={() => setSelected(null)}
          onChanged={(r) => {
            replace(r);
          }}
          onDeleted={(id) => {
            remove(id);
            setSelected(null);
            toast("Response deleted");
          }}
        />
      )}
    </>
  );
}

type DrawerProps = {
  response: AdminResponse;
  fields: FormField[];
  allColumns: FormField[];
  position: string;
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
  onChanged: (response: AdminResponse) => void;
  onDeleted: (id: string) => void;
};

function ResponseDrawer({ response, fields, allColumns, position, onPrev, onNext, onClose, onChanged, onDeleted }: DrawerProps) {
  const { toast, confirm } = useUi();
  const [notes, setNotes] = useState(response.notes);
  const [busy, setBusy] = useState(false);

  // Questions this response answered, in the order it saw them, then anything else it has data for.
  const shown = [...fields, ...allColumns.filter((c) => !fields.some((f) => f.id === c.id))].filter(
    (f) => response.answers[f.id] !== undefined || response.files[f.id],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest("textarea, input, select")) return;
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" || event.key === "k") onPrev?.();
      if (event.key === "ArrowRight" || event.key === "j") onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  async function patch(body: { status?: ResponseStatus; notes?: string }) {
    setBusy(true);
    try {
      const { response: updated } = await api<{ response: AdminResponse }>(`/responses/${response.id}`, { method: "PATCH", body });
      onChanged(updated);
      toast(body.status ? `Marked ${STATUS_LABELS[body.status].toLowerCase()}` : "Notes saved");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    const ok = await confirm({
      title: "Delete this response?",
      message: "The response and its uploaded files will be permanently deleted. This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/responses/${response.id}`, { method: "DELETE" });
      onDeleted(response.id);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Response">
      <button type="button" aria-label="Close" className="absolute inset-0 cursor-default bg-black/25" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-[560px] flex-col bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-black/[0.08] px-5 py-3">
          <Button size="sm" variant="ghost" onClick={onPrev} disabled={!onPrev} aria-label="Previous response">
            ←
          </Button>
          <Button size="sm" variant="ghost" onClick={onNext} disabled={!onNext} aria-label="Next response">
            →
          </Button>
          <span className="text-[13px] text-ink/50">{position}</span>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="mb-5 flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => s !== response.status && patch({ status: s })}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-[13px] font-medium ring-1 transition-colors disabled:opacity-60 ${
                  response.status === s ? "bg-ink text-white ring-ink" : "bg-white text-ink/65 ring-black/10 hover:text-ink"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          <p className="m-0 mb-5 text-[12px] text-ink/45">
            Submitted {formatDate(response.createdAt)} · form v{response.formVersion}
            {response.updatedBy && ` · last changed by ${response.updatedBy}`}
          </p>

          <dl className="m-0 grid gap-4">
            {shown.map((field) => {
              const file = response.files[field.id];
              const isRemoved = !fields.some((f) => f.id === field.id) || field.label.endsWith("(removed)");
              return (
                <div key={field.id}>
                  <dt className="mb-1 text-[12px] leading-snug font-medium text-ink/50">
                    {field.label}
                    {isRemoved && !field.label.endsWith("(removed)") && " (removed)"}
                  </dt>
                  <dd className="m-0 text-sm leading-relaxed break-words whitespace-pre-wrap text-ink">
                    {file ? (
                      <div className="flex items-center gap-3">
                        {/^image\/(jpeg|png|webp)$/.test(file.contentType) && (
                          <a href={fileUrl(file.key)} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={fileUrl(file.key)} alt={field.label} className="size-24 rounded-lg object-cover ring-1 ring-black/10" loading="lazy" />
                          </a>
                        )}
                        <div className="min-w-0">
                          <span className="block truncate">{file.name}</span>
                          <span className="text-[12px] text-ink/50">{formatBytes(file.size)}</span>
                          <span className="mt-1 flex gap-3 text-[13px]">
                            <a href={fileUrl(file.key)} target="_blank" rel="noopener noreferrer" className="text-ember underline">
                              Open
                            </a>
                            <a href={fileUrl(file.key, true)} className="text-ember underline">
                              Download
                            </a>
                          </span>
                        </div>
                      </div>
                    ) : field.type === "email" ? (
                      <a href={`mailto:${answerText(response.answers[field.id])}`} className="underline decoration-black/20">
                        {answerText(response.answers[field.id])}
                      </a>
                    ) : field.type === "phone" ? (
                      <span className="flex flex-wrap gap-x-3">
                        {answerText(response.answers[field.id])}
                        <a
                          href={`https://wa.me/${answerText(response.answers[field.id]).replace(/[^\d]/g, "").replace(/^0/, "94")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-emerald-700 underline"
                        >
                          WhatsApp
                        </a>
                      </span>
                    ) : Array.isArray(response.answers[field.id]) ? (
                      <ul className="m-0 list-disc pl-5">
                        {(response.answers[field.id] as string[]).map((v) => (
                          <li key={v}>{v}</li>
                        ))}
                      </ul>
                    ) : (
                      answerText(response.answers[field.id])
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>

          <div className="mt-8 border-t border-black/[0.08] pt-5">
            <label htmlFor="notes" className="mb-1.5 block text-[13px] font-medium text-ink/70">
              Committee notes (private)
            </label>
            <textarea id="notes" rows={4} className={`${adminInput} resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={5000} />
            <div className="mt-2 flex items-center justify-between">
              <Button size="sm" variant="primary" disabled={busy || notes === response.notes} onClick={() => patch({ notes })}>
                Save notes
              </Button>
              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={del}>
                Delete response
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
