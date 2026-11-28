"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ActivityLog } from "./activity-log";
import { FormEditor } from "./form-editor";
import { FormsList } from "./forms-list";
import { ResponsesView } from "./responses-view";
import { api, ApiError } from "./_lib/api";
import { Button, Spinner, UiProvider } from "./_components/ui";

type Auth = { state: "loading" } | { state: "ok"; email: string } | { state: "error"; status: number; message: string };

export type Navigate = (to: { view?: "forms" | "activity"; form?: string; tab?: "responses" | "edit" }) => void;

export function AdminApp() {
  const [auth, setAuth] = useState<Auth>({ state: "loading" });
  const params = useSearchParams();
  const router = useRouter();

  const checkAuth = useCallback(
    () =>
      api<{ email: string }>("/me").then(
        ({ email }) => setAuth({ state: "ok", email }),
        (error: ApiError) => setAuth({ state: "error", status: error.status, message: error.message }),
      ),
    [],
  );

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const navigate: Navigate = useCallback(
    ({ view, form, tab }) => {
      const query = new URLSearchParams();
      if (view === "activity") query.set("view", "activity");
      if (form) query.set("form", form);
      if (form && tab) query.set("tab", tab);
      router.push(`/admin${query.size ? `?${query}` : ""}`);
    },
    [router],
  );

  const view = params.get("view");
  const formId = params.get("form");
  const tab = params.get("tab") === "edit" ? "edit" : "responses";

  return (
    <UiProvider>
      <div className="min-h-screen bg-[#f6f5f3] text-[15px] leading-normal font-normal text-ink">
        <header className="sticky top-0 z-50 border-b border-black/[0.08] bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-4 px-4 sm:px-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="logo-mark size-7 bg-brand" />
              <span className="text-[15px] font-semibold tracking-tight">IEEE CS</span>
              <span className="text-[15px] font-light text-ink/50">Forms admin</span>
            </Link>
            {auth.state === "ok" && (
              <nav className="ml-4 flex items-center gap-1 max-sm:hidden">
                <NavLink active={view !== "activity"} onClick={() => navigate({})}>
                  Forms
                </NavLink>
                <NavLink active={view === "activity"} onClick={() => navigate({ view: "activity" })}>
                  Activity
                </NavLink>
              </nav>
            )}
            <div className="ml-auto flex items-center gap-3">
              <Link href="/" className="text-[13px] text-ink/55 hover:text-ink max-sm:hidden">
                View site ↗
              </Link>
              {auth.state === "ok" && (
                <>
                  <span className="max-w-[220px] truncate text-[13px] text-ink/70 max-md:hidden" title={auth.email}>
                    {auth.email}
                  </span>
                  <a href="/cdn-cgi/access/logout" className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink/70 hover:bg-black/5 hover:text-ink">
                    Sign out
                  </a>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8">
          {auth.state === "loading" && (
            <div className="flex items-center gap-3 py-20 text-ink/60">
              <Spinner /> Checking your sign-in…
            </div>
          )}
          {auth.state === "error" && <SignInProblem status={auth.status} message={auth.message} onRetry={checkAuth} />}
          {auth.state === "ok" &&
            (view === "activity" ? (
              <ActivityLog />
            ) : formId ? (
              tab === "edit" ? (
                <FormEditor key={formId} formId={formId} navigate={navigate} />
              ) : (
                <ResponsesView key={formId} formId={formId} navigate={navigate} />
              )
            ) : (
              <FormsList navigate={navigate} />
            ))}
        </div>
      </div>
    </UiProvider>
  );
}

function NavLink({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${active ? "bg-black/[0.06] text-ink" : "text-ink/55 hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

function SignInProblem({ status, message, onRetry }: { status: number; message: string; onRetry: () => void }) {
  const title =
    status === 401 ? "Please sign in" : status === 403 ? "You don't have access" : status === 503 ? "Sign-in isn't set up yet" : "Couldn't load the admin panel";
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-black/[0.08]">
      <span className="logo-mark mx-auto mb-5 size-12 bg-brand" />
      <h1 className="m-0 text-xl leading-tight font-semibold">{title}</h1>
      <p className="mt-3 mb-6 text-sm leading-relaxed text-ink/65">
        {status === 401
          ? "Your session has ended. Sign in again with your committee Google account."
          : status === 403
            ? `${message} Ask the chair to add your email to the admin list in Cloudflare Access.`
            : message}
      </p>
      <div className="flex justify-center gap-2">
        {status === 401 || status === 403 ? (
          status === 401 ? (
            <Button variant="primary" onClick={() => window.location.reload()}>
              Sign in
            </Button>
          ) : (
            <a href="/cdn-cgi/access/logout" className="inline-flex h-10 items-center rounded-lg bg-ink px-4 text-sm font-medium text-white hover:bg-black">
              Use another account
            </a>
          )
        ) : (
          <Button variant="primary" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
