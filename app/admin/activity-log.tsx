"use client";

import { useEffect, useState } from "react";
import { api, formatDate } from "./_lib/api";
import { Card, Spinner } from "./_components/ui";

type Entry = { at: string; actor: string; action: string; target: string; detail: string };

const ACTIONS: Record<string, string> = {
  "form.create": "created a form",
  "form.save": "saved a form",
  "form.open": "opened a form",
  "form.close": "closed a form",
  "form.delete": "deleted a form",
  "response.status": "changed a response's status",
  "response.delete": "deleted a response",
  "responses.export": "exported responses",
};

export function ActivityLog() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ entries: Entry[] }>("/audit")
      .then(({ entries }) => setEntries(entries))
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <>
      <h1 className="m-0 mb-1 text-2xl leading-tight font-semibold tracking-tight">Activity</h1>
      <p className="m-0 mb-6 text-sm text-ink/55">The last 300 changes made in the admin panel.</p>
      {error && <Card className="p-4 text-sm text-red-700">{error}</Card>}
      {!entries && !error && (
        <div className="flex items-center gap-3 py-12 text-ink/55">
          <Spinner /> Loading…
        </div>
      )}
      {entries && (
        <Card className="divide-y divide-black/[0.06]">
          {entries.length === 0 && <p className="m-0 p-6 text-sm text-ink/55">Nothing yet.</p>}
          {entries.map((entry, index) => (
            <div key={index} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm">
              <span className="w-44 shrink-0 text-[13px] text-ink/50 tabular-nums">{formatDate(entry.at)}</span>
              <span className="font-medium">{entry.actor}</span>
              <span className="text-ink/70">{ACTIONS[entry.action] ?? entry.action}</span>
              {entry.detail && <span className="font-mono text-[12px] text-ink/50">{entry.detail}</span>}
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
