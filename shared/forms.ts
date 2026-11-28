/**
 * Form definitions, shared by the public form page, the admin panel's editor and preview,
 * and the Pages Functions API. Validation lives here so the browser and the server apply
 * exactly the same rules.
 *
 * Plain TypeScript only: no DOM, Node or Workers APIs.
 */

export const FIELD_TYPES = [
  "short_text",
  "long_text",
  "email",
  "phone",
  "number",
  "date",
  "single_choice",
  "multi_choice",
  "dropdown",
  "file",
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  short_text: "Short answer",
  long_text: "Paragraph",
  email: "Email",
  phone: "Phone number",
  number: "Number",
  date: "Date",
  single_choice: "Multiple choice (pick one)",
  multi_choice: "Checkboxes (pick any)",
  dropdown: "Dropdown",
  file: "File upload",
};

export const CHOICE_TYPES: readonly FieldType[] = ["single_choice", "multi_choice", "dropdown"];
export const isChoice = (type: FieldType) => CHOICE_TYPES.includes(type);

export const FILE_KINDS = ["image", "pdf", "document"] as const;
export type FileKind = (typeof FILE_KINDS)[number];
export const FILE_KIND_LABELS: Record<FileKind, string> = {
  image: "Images (JPG, PNG, WebP, HEIC)",
  pdf: "PDF",
  document: "Word documents (DOC, DOCX)",
};
/** `accept` attribute values for the file picker. The server checks the file's bytes, not this. */
export const FILE_KIND_ACCEPT: Record<FileKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif",
  pdf: "application/pdf,.pdf",
  document: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
export const MAX_FILE_MB = 10;

export type ShowIf = { fieldId: string; anyOf: string[] };

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  help?: string;
  required: boolean;
  placeholder?: string;
  /** Choice fields. */
  options?: string[];
  /** Choice fields: adds an "Other" option with a text box. */
  allowOther?: boolean;
  /** Text fields. */
  maxLength?: number;
  /** Email fields: only accept addresses at this domain, e.g. "iit.ac.lk". */
  emailDomain?: string;
  /** File fields. */
  accept?: FileKind[];
  maxSizeMB?: number;
  /** Only show (and only require) this field when another choice field has one of these answers. */
  showIf?: ShowIf | null;
};

export type FormSection = { id: string; title: string; description?: string; fields: FormField[] };

export type FormSettings = {
  title: string;
  /** Shown above the form. Plain text: blank lines split paragraphs, lines starting with "- " or "* " are bullets. */
  intro: string;
  successMessage: string;
  closedMessage: string;
  /** ISO date-time; the form stops taking responses after it. */
  closesAt: string | null;
  /** One response per value of this field (for example the IIT email). */
  uniqueFieldId: string | null;
};

export type FormDefinition = { settings: FormSettings; sections: FormSection[] };

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;
export type FileMeta = { name: string; size: number };
export type StoredFile = FileMeta & { key: string; contentType: string };

export const OTHER_PREFIX = "Other: ";

export const LIMITS = {
  shortText: 300,
  longText: 5000,
  title: 200,
  intro: 20000,
  sections: 30,
  fieldsPerSection: 60,
  options: 100,
  optionLength: 300,
};

// ---------------------------------------------------------------------------------------------
// Helpers

export function allFields(form: Pick<FormDefinition, "sections">): FormField[] {
  return form.sections.flatMap((section) => section.fields);
}

export function newId(prefix: string) {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 10);
}

const asArray = (value: AnswerValue | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : value === "" ? [] : [value];

/** Whether a field is shown, given the answers so far. A field whose controlling field is hidden is hidden too. */
export function isVisible(field: FormField, fields: FormField[], answers: Answers, depth = 0): boolean {
  if (!field.showIf || !field.showIf.fieldId) return true;
  if (depth > 10) return false;
  const parent = fields.find((f) => f.id === field.showIf!.fieldId);
  if (!parent) return true; // the controlling field was deleted: show rather than hide forever
  if (!isVisible(parent, fields, answers, depth + 1)) return false;
  const picked = asArray(answers[parent.id]);
  return field.showIf.anyOf.some((option) => picked.includes(option));
}

export function isFormOpen(isOpen: boolean, settings: FormSettings, now = new Date()) {
  if (!isOpen) return false;
  if (settings.closesAt && new Date(settings.closesAt).getTime() <= now.getTime()) return false;
  return true;
}

/** Normalised value used to stop a second response with the same email etc. */
export function dedupeKey(value: AnswerValue | undefined) {
  const text = asArray(value).join(",").trim().toLowerCase();
  return text === "" ? null : text;
}

// ---------------------------------------------------------------------------------------------
// Answer validation (browser and server)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export type FieldErrors = Record<string, string>;

/**
 * Checks answers against the form. `files` says which file fields have a file chosen, with its
 * size. Returns the cleaned answers (hidden fields dropped, text trimmed) and any errors.
 */
export function validateAnswers(
  form: Pick<FormDefinition, "sections">,
  rawAnswers: Answers,
  files: Record<string, FileMeta | undefined>,
): { answers: Answers; errors: FieldErrors } {
  const fields = allFields(form);
  const answers: Answers = {};
  const errors: FieldErrors = {};

  for (const field of fields) {
    if (!isVisible(field, fields, rawAnswers)) continue;

    if (field.type === "file") {
      const file = files[field.id];
      if (!file) {
        if (field.required) errors[field.id] = "Please upload a file.";
        continue;
      }
      const max = (field.maxSizeMB || MAX_FILE_MB) * 1024 * 1024;
      if (file.size > max) errors[field.id] = `The file is too large. The limit is ${field.maxSizeMB || MAX_FILE_MB} MB.`;
      if (file.size === 0) errors[field.id] = "The file is empty.";
      continue;
    }

    const raw = rawAnswers[field.id];

    if (field.type === "multi_choice") {
      const picked = [...new Set(asArray(raw).map((v) => v.trim()).filter(Boolean))];
      const options = field.options ?? [];
      if (field.allowOther && picked.includes(OTHER_PREFIX.trim())) {
        errors[field.id] = 'Please fill in "Other".';
        continue;
      }
      const bad = picked.find((v) => !options.includes(v) && !(field.allowOther && v.startsWith(OTHER_PREFIX) && v.length > OTHER_PREFIX.length));
      if (bad !== undefined) errors[field.id] = "Please pick from the options.";
      else if (picked.length === 0 && field.required) errors[field.id] = "Please pick at least one.";
      if (picked.length) answers[field.id] = picked.map((v) => v.slice(0, LIMITS.optionLength));
      continue;
    }

    const value = (Array.isArray(raw) ? raw[0] ?? "" : raw ?? "").trim();
    if (value === "") {
      if (field.required) errors[field.id] = isChoice(field.type) ? "Please pick one." : "This question is required.";
      continue;
    }

    let error: string | undefined;
    switch (field.type) {
      case "short_text":
      case "long_text": {
        const max = field.maxLength || (field.type === "short_text" ? LIMITS.shortText : LIMITS.longText);
        if (value.length > max) error = `Please keep this under ${max} characters.`;
        break;
      }
      case "email": {
        if (!EMAIL.test(value) || value.length > 254) error = "Please enter a valid email address.";
        else if (field.emailDomain) {
          const domain = field.emailDomain.replace(/^@/, "").toLowerCase();
          if (!value.toLowerCase().endsWith("@" + domain)) error = `Please use your @${domain} email.`;
        }
        break;
      }
      case "phone": {
        const digits = value.replace(/[^\d]/g, "");
        if (!/^\+?[\d\s()-]+$/.test(value) || digits.length < 9 || digits.length > 15) error = "Please enter a valid phone number.";
        break;
      }
      case "number":
        if (!/^-?\d+(\.\d+)?$/.test(value)) error = "Please enter a number.";
        break;
      case "date": {
        const time = Date.parse(value);
        if (!DATE.test(value) || Number.isNaN(time)) error = "Please enter a valid date.";
        break;
      }
      case "single_choice":
      case "dropdown": {
        const options = field.options ?? [];
        const isOther = field.allowOther && value.startsWith(OTHER_PREFIX) && value.length > OTHER_PREFIX.length;
        if (field.allowOther && value === OTHER_PREFIX.trim()) error = 'Please fill in "Other".';
        else if (!options.includes(value) && !isOther) error = "Please pick from the options.";
        break;
      }
    }
    if (error) errors[field.id] = error;
    answers[field.id] = value.slice(0, LIMITS.longText);
  }

  return { answers, errors };
}

// ---------------------------------------------------------------------------------------------
// Form definition validation (used by the API when an admin saves)

const str = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");

/** Cleans a form definition sent by the admin panel. Returns an error message for anything unusable. */
export function sanitizeDefinition(input: unknown): { form?: FormDefinition; error?: string } {
  if (!input || typeof input !== "object") return { error: "Invalid form." };
  const { settings: s, sections: rawSections } = input as Record<string, unknown>;
  if (!s || typeof s !== "object" || !Array.isArray(rawSections)) return { error: "Invalid form." };
  const rs = s as Record<string, unknown>;

  const settings: FormSettings = {
    title: str(rs.title, LIMITS.title).trim(),
    intro: str(rs.intro, LIMITS.intro),
    successMessage: str(rs.successMessage, 2000),
    closedMessage: str(rs.closedMessage, 2000),
    closesAt: typeof rs.closesAt === "string" && !Number.isNaN(Date.parse(rs.closesAt)) ? new Date(rs.closesAt).toISOString() : null,
    uniqueFieldId: typeof rs.uniqueFieldId === "string" && rs.uniqueFieldId ? rs.uniqueFieldId : null,
  };
  if (!settings.title) return { error: "The form needs a title." };
  if (rawSections.length === 0) return { error: "The form needs at least one section." };
  if (rawSections.length > LIMITS.sections) return { error: `A form can have at most ${LIMITS.sections} sections.` };

  const ids = new Set<string>();
  const sections: FormSection[] = [];
  for (const rawSection of rawSections) {
    const section = rawSection as Record<string, unknown>;
    if (!Array.isArray(section.fields)) return { error: "Invalid section." };
    if (section.fields.length > LIMITS.fieldsPerSection) return { error: `A section can have at most ${LIMITS.fieldsPerSection} questions.` };
    const fields: FormField[] = [];
    for (const rawField of section.fields) {
      const f = rawField as Record<string, unknown>;
      const id = str(f.id, 40);
      if (!/^[a-z0-9_]{2,40}$/i.test(id) || ids.has(id)) return { error: "Every question needs a unique id." };
      ids.add(id);
      const type = FIELD_TYPES.includes(f.type as FieldType) ? (f.type as FieldType) : null;
      if (!type) return { error: `Unknown question type "${String(f.type)}".` };
      const label = str(f.label, 1000).trim();
      if (!label) return { error: "Every question needs a title." };
      const field: FormField = { id, type, label, required: f.required === true };
      const help = str(f.help, 3000).trim();
      if (help) field.help = help;
      const placeholder = str(f.placeholder, 200).trim();
      if (placeholder) field.placeholder = placeholder;
      if (isChoice(type)) {
        const options = Array.isArray(f.options) ? f.options.map((o) => str(o, LIMITS.optionLength).trim()).filter(Boolean) : [];
        const unique = [...new Set(options)].slice(0, LIMITS.options);
        if (unique.length === 0) return { error: `"${label}" needs at least one option.` };
        field.options = unique;
        if (f.allowOther === true) field.allowOther = true;
      }
      if ((type === "short_text" || type === "long_text") && typeof f.maxLength === "number" && f.maxLength > 0) {
        field.maxLength = Math.min(Math.floor(f.maxLength), type === "short_text" ? LIMITS.shortText : LIMITS.longText);
      }
      if (type === "email") {
        const domain = str(f.emailDomain, 100).trim().replace(/^@/, "").toLowerCase();
        if (domain) {
          if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return { error: `"${domain}" is not a valid email domain.` };
          field.emailDomain = domain;
        }
      }
      if (type === "file") {
        const accept = Array.isArray(f.accept) ? f.accept.filter((k): k is FileKind => FILE_KINDS.includes(k as FileKind)) : [];
        field.accept = accept.length ? [...new Set(accept)] : ["image", "pdf", "document"];
        const size = typeof f.maxSizeMB === "number" ? f.maxSizeMB : MAX_FILE_MB;
        field.maxSizeMB = Math.min(Math.max(1, Math.round(size)), MAX_FILE_MB);
      }
      const showIf = f.showIf as Record<string, unknown> | null | undefined;
      if (showIf && typeof showIf.fieldId === "string" && showIf.fieldId && Array.isArray(showIf.anyOf) && showIf.anyOf.length) {
        field.showIf = { fieldId: showIf.fieldId, anyOf: showIf.anyOf.map((o) => str(o, LIMITS.optionLength)).filter(Boolean) };
      }
      fields.push(field);
    }
    sections.push({
      id: /^[a-z0-9_]{2,40}$/i.test(str(section.id, 40)) ? str(section.id, 40) : newId("s_"),
      title: str(section.title, LIMITS.title).trim(),
      description: str(section.description, 5000).trim() || undefined,
      fields,
    });
  }

  // Conditions must point at an earlier choice field that still exists, using its options.
  const fields = sections.flatMap((section) => section.fields);
  for (const [index, field] of fields.entries()) {
    if (!field.showIf) continue;
    const parentIndex = fields.findIndex((f) => f.id === field.showIf!.fieldId);
    const parent = fields[parentIndex];
    if (!parent || parentIndex >= index || !isChoice(parent.type)) {
      return { error: `"${field.label}" has a condition on a question that comes after it or is not a choice question.` };
    }
    field.showIf.anyOf = field.showIf.anyOf.filter((option) => parent.options?.includes(option));
    if (field.showIf.anyOf.length === 0) delete field.showIf;
  }

  if (settings.uniqueFieldId) {
    const unique = fields.find((f) => f.id === settings.uniqueFieldId);
    if (!unique || unique.type === "file") settings.uniqueFieldId = null;
  }
  if (fields.length === 0) return { error: "The form needs at least one question." };

  return { form: { settings, sections } };
}

export function isValidSlug(slug: string) {
  return /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/.test(slug);
}

// ---------------------------------------------------------------------------------------------
// Templates

export function blankForm(): FormDefinition {
  return {
    settings: {
      title: "Untitled form",
      intro: "",
      successMessage: "Thanks! We have received your response.",
      closedMessage: "This form is not taking responses right now.",
      closesAt: null,
      uniqueFieldId: null,
    },
    sections: [{ id: newId("s_"), title: "", fields: [{ id: newId("f_"), type: "short_text", label: "Full name", required: true }] }],
  };
}

const TEAMS = [
  "Public Visibility Team (Designing & Video Editing)",
  "Secretarial Team",
  "Industry Outreach Team",
  "Program and Logistics Team",
  "Photography and Videography Team",
  "Development Team",
  "Moderator",
];

/** The 2026/27 volunteering call, as a starting point. */
export function volunteerTemplate(): FormDefinition {
  return {
    settings: {
      title: "Volunteering Form 2026/27",
      intro: `IEEE Computer Society Student Branch Chapter of IIT is announcing an exclusive opportunity for you all to be a collaborative partner of the world's leading organization of computing and information.

In the 2025/2026 term, IEEE CS SBC of IIT delivered impactful initiatives that brought together learning, growth and meaningful experiences for the student community.

- CyberQuest: hands-on cybersecurity and CTF challenges
- IndustPro 5.0: industry visits and career development
- CodeRally 7.0: competitive programming and hackathon experience
- Microsoft Build //localhost Sri Lanka 2026: Microsoft AI, Azure and developer networking
- GDG Build with AI, IIT Buildathon: hands-on Google AI solution development

Choose your volunteering team. You don't need to be a professional: we offer guidance and welcome all levels of expertise.

- Public Visibility Team (Designing & Video Editing): if you're into video editing and creating eye-catching posters, this team is for you. You'll help boost our public image.
- Secretarial Team: if you're a skilled writer and editor, join this team to craft compelling content.
- Industry Outreach Team: if you're fluent in English and love interacting with people, this team is for you.
- Program and Logistics Team: if you're good at managing tasks from start to finish, this team needs your organizational skills to ensure smooth event execution.
- Photography & Videography Team: if you have a passion for capturing moments, creating stunning visuals and telling stories through your lens, this team will be perfect for you.
- Development Team: if you're interested in web or app development, coding, or creating tech solutions, join this team to work on exciting projects and sharpen your technical skills.

Start your own journey at IEEE CS SBC of IIT as a volunteer and take part in event series that will help you become a technical leader. Volunteers can earn:

- Best Volunteer certificates
- Best Volunteer of the Month certificates
- More connections with the industry
- Swag, tickets and much more

For further information, contact:

- Dulansa Manamperi (Chairperson): +94 76 824 7515
- Gayathmi Udanya (Vice-Chairperson): +94 76 674 9498
- Rashmi Kalpage (Membership Development Coordinator): +94 77 084 7678`,
      successMessage:
        "Thank you for applying to volunteer with IEEE CS SBC of IIT! We'll reach out on WhatsApp or by email once we've reviewed the applications.",
      closedMessage: "Volunteer applications for this term are closed. Follow us on social media to hear when the next call opens.",
      closesAt: null,
      uniqueFieldId: "iit_email",
    },
    sections: [
      {
        id: "s_about",
        title: "About you",
        fields: [
          { id: "full_name", type: "short_text", label: "Full Name", required: true },
          { id: "iit_email", type: "email", label: "IIT Email", required: true, emailDomain: "iit.ac.lk", placeholder: "name.2024xxxx@iit.ac.lk" },
          { id: "student_number", type: "short_text", label: "IIT Student Number", required: true, maxLength: 30 },
          { id: "whatsapp", type: "phone", label: "WhatsApp Number", required: true, placeholder: "+94 7X XXX XXXX" },
          { id: "level", type: "single_choice", label: "Level of Study", required: true, options: ["Foundation", "Level 04", "Level 05", "Level 06"] },
          {
            id: "degree",
            type: "dropdown",
            label: "Degree Program",
            required: true,
            allowOther: true,
            options: [
              "BEng (Hons) Software Engineering",
              "BSc (Hons) Computer Science",
              "BSc (Hons) Artificial Intelligence And Data Science",
              "BSc (Hons) Business Data Analytics",
              "BSc (Hons) Business Information Systems",
              "BA (Hons) Business Management",
              "Bachelor of Business Administration (BBA)",
              "BSc (Hons) Fintech with Data Analytics",
              "BEng (Hons) Artificial Intelligence and Data Engineering",
              "BSc (Hons) Business Computing",
            ],
          },
          { id: "dob", type: "date", label: "Date of Birth", required: true },
        ],
      },
      {
        id: "s_volunteering",
        title: "Volunteering",
        fields: [
          { id: "teams", type: "multi_choice", label: "What team would you like to volunteer for?", required: true, options: TEAMS },
          {
            id: "proficiency",
            type: "file",
            label: "Please attach the document that includes your proficiency",
            help: "A portfolio, CV or samples of your work.",
            required: true,
            accept: ["pdf", "document", "image"],
            maxSizeMB: 10,
            showIf: {
              fieldId: "teams",
              anyOf: [TEAMS[0], TEAMS[1], TEAMS[4], TEAMS[5], TEAMS[6]],
            },
          },
          {
            id: "photo",
            type: "file",
            label: "Please upload a professional photograph of yourself",
            help: "This photograph will be published on the posters we make for events, so make sure it's a decent one.",
            required: true,
            accept: ["image"],
            maxSizeMB: 10,
          },
        ],
      },
    ],
  };
}

/**
 * Columns for a table of responses: the current form's questions in order, then questions that
 * only exist in older versions (so answers to removed questions are never lost).
 */
export function responseColumns(current: Pick<FormDefinition, "sections">, versions: Record<number, Pick<FormDefinition, "sections">>): FormField[] {
  const columns = allFields(current);
  const seen = new Set(columns.map((f) => f.id));
  const older = Object.keys(versions)
    .map(Number)
    .sort((a, b) => b - a);
  for (const version of older) {
    for (const field of allFields(versions[version])) {
      if (!seen.has(field.id)) {
        seen.add(field.id);
        columns.push({ ...field, label: `${field.label} (removed)` });
      }
    }
  }
  return columns;
}

/** The question definition a given response was answered against (falls back to the current form). */
export function fieldsForVersion(versions: Record<number, Pick<FormDefinition, "sections">>, version: number, current: Pick<FormDefinition, "sections">) {
  return allFields(versions[version] ?? current);
}
