"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import {
  allFields,
  FILE_KIND_ACCEPT,
  isVisible,
  MAX_FILE_MB,
  OTHER_PREFIX,
  type AnswerValue,
  type Answers,
  type FieldErrors,
  type FormDefinition,
  type FormField,
} from "@/shared/forms";

export type FormRendererProps = {
  definition: Pick<FormDefinition, "sections">;
  answers: Answers;
  files: Record<string, File | null | undefined>;
  errors: FieldErrors;
  onAnswer: (fieldId: string, value: AnswerValue) => void;
  onFile: (fieldId: string, file: File | null) => void;
  disabled?: boolean;
};

export const inputClass =
  "block w-full rounded-xl border border-line bg-white px-4 py-3.5 text-base leading-6 font-normal text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:bg-black/[0.03] aria-[invalid=true]:border-red-500";

const OTHER = OTHER_PREFIX.trim();

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FormRenderer({ definition, answers, files, errors, onAnswer, onFile, disabled }: FormRendererProps) {
  const fields = allFields(definition);
  return (
    <div className="flex flex-col gap-12">
      {definition.sections.map((section) => {
        const visible = section.fields.filter((field) => isVisible(field, fields, answers));
        if (visible.length === 0) return null;
        return (
          <fieldset key={section.id} className="m-0 flex min-w-0 flex-col gap-8 border-0 p-0">
            {(section.title || section.description) && (
              <legend className="mb-8 w-full border-b border-line pb-4">
                {section.title && <span className="block text-[1.75rem] leading-tight font-medium tracking-tight text-ink">{section.title}</span>}
                {section.description && <span className="mt-2 block text-base leading-relaxed font-light text-ink/65">{section.description}</span>}
              </legend>
            )}
            {visible.map((field) => (
              <Field
                key={field.id}
                field={field}
                value={answers[field.id]}
                file={files[field.id] ?? null}
                error={errors[field.id]}
                onAnswer={(value) => onAnswer(field.id, value)}
                onFile={(file) => onFile(field.id, file)}
                disabled={disabled}
              />
            ))}
          </fieldset>
        );
      })}
    </div>
  );
}

type FieldProps = {
  field: FormField;
  value: AnswerValue | undefined;
  file: File | null;
  error?: string;
  onAnswer: (value: AnswerValue) => void;
  onFile: (file: File | null) => void;
  disabled?: boolean;
};

function Field({ field, value, file, error, onAnswer, onFile, disabled }: FieldProps) {
  const id = useId();
  const inputId = `${id}-input`;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const described = [field.help ? helpId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;
  const isGroup = field.type === "single_choice" || field.type === "multi_choice";
  const Label = isGroup ? "p" : "label";

  return (
    <div
      data-field={field.id}
      role={isGroup ? "group" : undefined}
      aria-labelledby={isGroup ? `${id}-label` : undefined}
      className="flex flex-col gap-2.5"
    >
      <Label id={`${id}-label`} {...(isGroup ? {} : { htmlFor: inputId })} className="m-0 text-lg leading-snug font-normal text-ink">
        {field.label}
        {field.required && (
          <span className="ml-1 text-ember" aria-hidden>
            *
          </span>
        )}
        {field.required && <span className="sr-only"> (required)</span>}
      </Label>
      {field.help && (
        <p id={helpId} className="-mt-1 m-0 text-[15px] leading-snug font-light text-ink/60">
          {field.help}
        </p>
      )}
      <FieldInput
        field={field}
        value={value}
        file={file}
        inputId={inputId}
        described={described}
        invalid={!!error}
        onAnswer={onAnswer}
        onFile={onFile}
        disabled={disabled}
      />
      {error && (
        <p id={errorId} role="alert" className="m-0 text-[15px] leading-snug font-normal text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = Omit<FieldProps, "error"> & { inputId: string; described?: string; invalid: boolean };

function FieldInput({ field, value, file, inputId, described, invalid, onAnswer, onFile, disabled }: InputProps) {
  const text = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  const common = {
    id: inputId,
    "aria-describedby": described,
    "aria-invalid": invalid,
    "aria-required": field.required,
    disabled,
  };

  switch (field.type) {
    case "short_text":
    case "email":
    case "phone":
    case "number":
    case "date": {
      const type = { short_text: "text", email: "email", phone: "tel", number: "text", date: "date" }[field.type];
      const autoComplete = { short_text: undefined, email: "email", phone: "tel", number: "off", date: "off" }[field.type];
      return (
        <input
          {...common}
          type={type}
          inputMode={field.type === "number" ? "decimal" : undefined}
          autoComplete={autoComplete}
          placeholder={field.placeholder}
          maxLength={field.maxLength ?? (field.type === "short_text" ? 300 : 254)}
          value={text}
          onChange={(event) => onAnswer(event.target.value)}
          className={`${inputClass} ${field.type === "date" ? "max-w-[240px]" : ""}`}
        />
      );
    }
    case "long_text":
      return (
        <textarea
          {...common}
          rows={5}
          placeholder={field.placeholder}
          maxLength={field.maxLength ?? 5000}
          value={text}
          onChange={(event) => onAnswer(event.target.value)}
          className={`${inputClass} resize-y`}
        />
      );
    case "dropdown": {
      const isOther = field.allowOther && text.startsWith(OTHER);
      return (
        <div className="flex flex-col gap-2.5">
          <select
            {...common}
            value={isOther ? OTHER : text}
            onChange={(event) => onAnswer(event.target.value === OTHER ? OTHER_PREFIX : event.target.value)}
            className={`${inputClass} cursor-pointer appearance-none bg-[length:14px] bg-[right_1rem_center] bg-no-repeat pr-10`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%231e1e1e' stroke-width='1.6'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="">Choose…</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            {field.allowOther && <option value={OTHER}>Other…</option>}
          </select>
          {isOther && (
            <input
              type="text"
              aria-label={`${field.label}: other`}
              placeholder="Please specify"
              maxLength={250}
              disabled={disabled}
              value={text.slice(OTHER_PREFIX.length)}
              onChange={(event) => onAnswer(OTHER_PREFIX + event.target.value)}
              className={inputClass}
              autoFocus
            />
          )}
        </div>
      );
    }
    case "single_choice":
    case "multi_choice": {
      const multi = field.type === "multi_choice";
      const picked = Array.isArray(value) ? value : value ? [value] : [];
      const otherValue = picked.find((v) => v.startsWith(OTHER));
      const toggle = (option: string, on: boolean) => {
        if (!multi) return onAnswer(option);
        const rest = picked.filter((v) => (option === OTHER_PREFIX ? !v.startsWith(OTHER) : v !== option));
        onAnswer(on ? [...rest, option] : rest);
      };
      const choices = [...(field.options ?? []).map((o) => ({ label: o, value: o })), ...(field.allowOther ? [{ label: "Other", value: OTHER_PREFIX }] : [])];
      return (
        <div className="flex flex-col gap-2" aria-describedby={described}>
          {choices.map(({ label, value: optionValue }) => {
            const checked = optionValue === OTHER_PREFIX ? otherValue !== undefined : picked.includes(optionValue);
            return (
              <label
                key={optionValue}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-base leading-snug font-normal transition-colors ${
                  checked ? "border-brand bg-glow/40 text-ink" : "border-line bg-white text-ink/85 hover:border-ink/25"
                } ${disabled ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  type={multi ? "checkbox" : "radio"}
                  name={inputId}
                  checked={checked}
                  disabled={disabled}
                  onChange={(event) => toggle(optionValue, event.target.checked)}
                  className="mt-0.5 size-[18px] shrink-0 cursor-pointer accent-[var(--color-ember)]"
                />
                <span>{label}</span>
              </label>
            );
          })}
          {otherValue !== undefined && (
            <input
              type="text"
              aria-label={`${field.label}: other`}
              placeholder="Please specify"
              maxLength={250}
              disabled={disabled}
              value={otherValue.slice(OTHER_PREFIX.length)}
              onChange={(event) => {
                const next = OTHER_PREFIX + event.target.value;
                onAnswer(multi ? [...picked.filter((v) => !v.startsWith(OTHER)), next] : next);
              }}
              className={inputClass}
            />
          )}
        </div>
      );
    }
    case "file":
      return <FileInput field={field} file={file} inputId={inputId} described={described} invalid={invalid} onFile={onFile} disabled={disabled} />;
  }
}

function FileInput({
  field,
  file,
  inputId,
  described,
  invalid,
  onFile,
  disabled,
}: Pick<InputProps, "field" | "file" | "inputId" | "described" | "invalid" | "onFile" | "disabled">) {
  const input = useRef<HTMLInputElement>(null);
  const accept = (field.accept ?? []).map((kind) => FILE_KIND_ACCEPT[kind]).join(",");
  const kinds = (field.accept ?? []).map((k) => ({ image: "images", pdf: "PDF", document: "Word" })[k]).join(", ");
  const preview = useMemo(
    () => (file && file.type.startsWith("image/") && !/heic|heif/.test(file.type) ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border border-dashed p-3 ${invalid ? "border-red-500" : "border-ink/20"} ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <input
        ref={input}
        id={inputId}
        type="file"
        accept={accept}
        aria-describedby={described}
        aria-invalid={invalid}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          onFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
      {file ? (
        <>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-glow/50 text-xs font-medium text-ember uppercase">
              {file.name.split(".").pop()?.slice(0, 4)}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base leading-snug font-normal text-ink">{file.name}</span>
            <span className="block text-sm leading-snug font-light text-ink/55">{formatBytes(file.size)}</span>
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => input.current?.click()}
            className="cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-ink/70 hover:bg-black/5"
          >
            Change
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onFile(null)}
            className="cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={() => input.current?.click()}
            className="cursor-pointer rounded-full bg-ink px-5 py-2.5 text-[15px] leading-none font-medium text-white transition-colors hover:bg-brand hover:text-ink"
          >
            Choose file
          </button>
          <span className="text-sm leading-snug font-light text-ink/55">
            {kinds}, up to {field.maxSizeMB || MAX_FILE_MB} MB
          </span>
        </>
      )}
    </div>
  );
}
