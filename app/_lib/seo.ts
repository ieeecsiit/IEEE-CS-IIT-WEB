import type { Metadata } from "next";

/**
 * Single source of truth for everything crawlers, social cards and AI assistants read.
 *
 * Page metadata, robots.txt, the sitemap, llms.txt and the JSON-LD blocks all derive from
 * here, so the chapter is described the same way everywhere. Mirrors lib/seo.ts on the
 * IEEE Student Branch site (ieee.iit.ac.lk), which lists this site as its CS chapter.
 */

/** No trailing slash: every URL in this file is built by appending a path. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://csieeeiit.cloud").replace(/\/$/, "");

export const SITE_NAME = "IEEE Computer Society Student Branch Chapter of IIT";

export const SITE_SHORT_NAME = "IEEE CS IIT";

export const SITE_TAGLINE = "Innovate • Automate • Dominate";

export const SITE_DESCRIPTION =
  "The IEEE Computer Society Student Branch Chapter of the Informatics Institute of Technology (IIT), Sri Lanka. Since 2017 we have run hackathons, competitive programming contests, web development workshops, career guidance series and the StackMedium writing programme for 500+ members and 5,000+ delegates.";

export const ORGANISATION = {
  legalName: "IEEE Computer Society Student Branch Chapter of Informatics Institute of Technology",
  alternateNames: ["IEEE CS IIT", "IEEE Computer Society IIT", "IEEE CS SBC of IIT"],
  foundingDate: "2017",
  email: "ieeecs@iit.ac.lk",
  address: {
    streetAddress: "No 10, Trelawney Place",
    addressLocality: "Colombo",
    postalCode: "00400",
    addressRegion: "Western Province",
    addressCountry: "LK",
  },
} as const;

export const PARENT_ORGANISATION = { name: "IEEE Student Branch of IIT", url: "https://ieee.iit.ac.lk/" };
export const IEEE_COMPUTER_SOCIETY = { name: "IEEE Computer Society", url: "https://www.computer.org/" };
export const HOST_INSTITUTE = { name: "Informatics Institute of Technology", url: "https://www.iit.ac.lk/" };

/** Lets search engines tie this site to the same entity elsewhere (`sameAs`). */
export const SOCIAL_PROFILES = [
  "https://www.linkedin.com/company/ieee-computer-society-student-chapter-of-iit",
  "https://www.instagram.com/ieeecs_iit",
  "https://www.facebook.com/share/16K7UtsrNt/",
  "https://www.tiktok.com/@ieeecsiit",
  "https://youtube.com/@ieeecomputersocietystudent5208",
  "https://medium.com/@ieeecomputersocietyiit",
];

/** Topics the chapter works in, for `knowsAbout` and page keywords. */
export const TOPICS = [
  "Computer science",
  "Software engineering",
  "Competitive programming",
  "Hackathons",
  "Web development",
  "Artificial intelligence",
  "Cybersecurity",
  "Technical writing",
  "Career development",
  "IEEE Computer Society",
];

export const OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` };

/** Absolute URL for a site-relative path. Required by JSON-LD, the sitemap and llms.txt. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Social platforms truncate descriptions around 200 characters. Cutting on a word boundary
 * avoids the mid-word ellipsis that looks like a bug.
 */
export function truncate(text: string, max = 200): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max)}…`;
}

type PageImage = { url: string; width?: number; height?: number; alt?: string };

/**
 * Full metadata for one page. Next replaces nested objects like `openGraph` wholesale
 * rather than merging them with the layout's, so every page builds the complete set here.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = OG_IMAGE,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  keywords = [],
}: {
  /** Without the site name; the layout's title template appends it. Omit for the home page. */
  title?: string;
  description: string;
  path: string;
  image?: PageImage;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_SHORT_NAME}` : SITE_NAME;
  const summary = truncate(description, 160);
  return {
    ...(title ? { title } : {}),
    description: summary,
    keywords: [...keywords, ...TOPICS],
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: SITE_NAME,
      locale: "en_LK",
      title: fullTitle,
      description: truncate(description, 200),
      images: [image],
      ...(type === "article" ? { publishedTime, modifiedTime, authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: truncate(description, 200),
      images: [image],
    },
  };
}
