export type ContentBlock = { type: "paragraph"; text: string } | { type: "heading"; text: string };

export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Event = {
  slug: string;
  title: string;
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
  badge: string;
  author: string;
  authorImage: string;
  cardImage: string;
  image: string;
  imageAlt: string;
  sections: BlogSection[];
  mediumUrl: string;
};

export type TeamMember = {
  name: string;
  role: string;
  image: string;
  linkedin: string;
  email: string;
};
