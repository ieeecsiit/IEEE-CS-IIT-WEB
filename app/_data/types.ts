export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

export type Event = {
  slug: string;
  title: string;
  category: string;
  year: string;
  aboutHeading: string;
  coverImage: string;
  content: ContentBlock[];
  gallery: string[];
  website?: string;
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
