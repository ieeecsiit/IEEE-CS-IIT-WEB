"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-black disabled:bg-ink/40",
  secondary: "bg-white text-ink ring-1 ring-black/12 hover:bg-black/[0.03] disabled:text-ink/40",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  ghost: "text-ink/70 hover:bg-black/5 hover:text-ink disabled:text-ink/30",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed ${
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm"
      } ${variants[variant]} ${className}`}
    />
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "green" | "amber" | "red" | "blue"; children: ReactNode }) {
  const tones = {
    neutral: "bg-black/[0.06] text-ink/70",
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
    blue: "bg-sky-100 text-sky-800",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs leading-none font-medium ${tones[tone]}`}>{children}</span>;
}

export const STATUS_TONES = { new: "blue", shortlisted: "amber", accepted: "green", rejected: "red" } as const;

export const adminInput =
  "block w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm leading-5 text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:bg-black/[0.03]";

export function Label({ children, hint, htmlFor }: { children: ReactNode; hint?: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] leading-tight font-medium text-ink/80">
      {children}
      {hint && <span className="mt-0.5 block font-normal text-ink/50">{hint}</span>}
    </label>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-white ring-1 ring-black/[0.08] ${className}`}>{children}</div>;
}

// --- Modal --------------------------------------------------------------------------------------

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`m-auto w-[calc(100%-2rem)] rounded-2xl bg-white p-0 text-ink shadow-2xl backdrop:bg-black/40 ${wide ? "max-w-2xl" : "max-w-md"}`}
    >
      {open && (
        <div className="p-6">
          <h2 className="m-0 mb-4 text-lg leading-tight font-semibold">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}

type ConfirmOptions = { title: string; message: ReactNode; confirmLabel?: string; danger?: boolean; typeToConfirm?: string };
type Toast = { id: number; text: string; tone: "success" | "error" };

const UiContext = createContext<{
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  toast: (text: string, tone?: Toast["tone"]) => void;
} | null>(null);

export function useUi() {
  const ui = useContext(UiContext);
  if (!ui) throw new Error("useUi outside UiProvider");
  return ui;
}

/** Confirmation dialogs and toasts for the whole admin panel. */
export function UiProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const [typed, setTyped] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setTyped("");
        setPending({ ...options, resolve });
      }),
    [],
  );
  const toast = useCallback((text: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, text, tone }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), tone === "error" ? 7000 : 3500);
  }, []);

  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };
  const blocked = !!pending?.typeToConfirm && typed !== pending.typeToConfirm;

  return (
    <UiContext.Provider value={{ confirm, toast }}>
      {children}
      <Modal open={!!pending} onClose={() => close(false)} title={pending?.title ?? ""}>
        {pending && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!blocked) close(true);
            }}
          >
            <div className="text-sm leading-relaxed text-ink/75">{pending.message}</div>
            {pending.typeToConfirm && (
              <div className="mt-4">
                <Label htmlFor="confirm-type">
                  Type <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[13px]">{pending.typeToConfirm}</code> to confirm
                </Label>
                <input id="confirm-type" autoFocus className={adminInput} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => close(false)}>Cancel</Button>
              <Button type="submit" variant={pending.danger ? "danger" : "primary"} disabled={blocked} autoFocus={!pending.typeToConfirm}>
                {pending.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[10000] flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-sm rounded-lg px-4 py-3 text-sm leading-snug font-medium shadow-lg ${
              t.tone === "error" ? "bg-red-600 text-white" : "bg-ink text-white"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </UiContext.Provider>
  );
}
