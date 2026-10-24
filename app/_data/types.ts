export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  /** Rendered by the CMS's own rich text converter, which escapes text and strips unsafe link URLs. */
  | { type: "html"; html: string };

export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Event = {
  slug: string;
  title: string;
  /** First paragraph of the description, as plain text, for link previews. */
  summary?: string;
  /** ISO timestamp of the (first) event day. */
  date: string;
  dateLabel: string;
  monthLabel: string;
  location?: string;
  coverImage: Photo;
  content: ContentBlock[];
  gallery: Photo[];
  /** Only set while the event is still upcoming. */
  registrationLink?: string;
};

export type BlogSection = {
  heading?: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  /** ISO timestamp the post went live, used for ordering. */
  date: string;
  badge?: string;
  author: string;
  authorImage?: Photo;
  cardImage: Photo;
  image: Photo;
  /** Plain text, for link previews. */
  summary?: string;
  /** Intro paragraphs shown under an "Overview" heading above the body. */
  overview?: string[];
  /** Rendered by the CMS's own rich text converter, which escapes text and strips unsafe link URLs. */
  html: string;
  readMoreUrl?: string;
};

export type TeamMember = {
  name: string;
  role: string;
  image: string;
  linkedin: string;
  email: string;
};
