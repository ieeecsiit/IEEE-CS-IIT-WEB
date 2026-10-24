"use client";

import { useState, type FormEvent } from "react";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSca4K50sO2CYZTQMBXNUfQnhrwmttF_MDgH_XxDOueZYvAlpg/formResponse";

// Maps each input to its Google Form entry id.
const fields = [
  { name: "entry.1111111111", placeholder: "Name *", type: "text", required: true },
  { name: "entry.2222222222", placeholder: "Last Name *", type: "text", required: true },
  { name: "entry.3333333333", placeholder: "Email Address *", type: "email", required: true },
  { name: "entry.4444444444", placeholder: "Phone Number", type: "tel", required: false },
] as const;

const inputClass =
  "block w-full min-h-[50px] rounded-[5px] border border-line bg-white px-5 pt-[25px] pb-5 text-xl leading-5 font-normal text-black outline-none placeholder:text-black focus:border-brand";

export function ContactForm() {
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    try {
      await fetch(GOOGLE_FORM_URL, { method: "POST", mode: "no-cors", body: new FormData(form) });
      alert("Thank you! Your message has been sent.");
      form.reset();
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-5 max-xs:grid-cols-1">
        {fields.map((field) => (
          <input key={field.name} maxLength={256} aria-label={field.placeholder} className={inputClass} {...field} />
        ))}
        <textarea
          name="entry.5555555555"
          placeholder="Message *"
          aria-label="Message *"
          required
          maxLength={256}
          rows={4}
          className={`${inputClass} col-span-2 resize-y max-xs:col-span-1`}
        />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="mt-5 inline-block cursor-pointer rounded-[5px] bg-brand px-10 py-5 text-xl font-medium text-white uppercase transition-all duration-300 hover:bg-ink disabled:opacity-60 max-xs:mt-2.5 max-xs:px-[60px] max-xs:text-[19px]"
      >
        {sending ? "sending..." : "send"}
      </button>
    </form>
  );
}
