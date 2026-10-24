import type { BlogPost, Event, TeamMember } from "@/app/_data/types";
import {
  HOST_INSTITUTE,
  IEEE_COMPUTER_SOCIETY,
  ORGANISATION,
  PARENT_ORGANISATION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SHORT_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
  TOPICS,
  absoluteUrl,
  truncate,
} from "./seo";

/**
 * Schema.org builders.
 *
 * Every node carries an `@id` so nodes reference each other instead of repeating
 * themselves: a page points at the organisation rather than describing it again, which
 * is what lets a crawler treat them as one entity across the whole site.
 */

export const ORGANISATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
const LOGO_ID = `${SITE_URL}/#logo`;

const address = { "@type": "PostalAddress", ...ORGANISATION.address };

export function organisationSchema() {
  return {
    "@type": ["Organization", "EducationalOrganization"],
    "@id": ORGANISATION_ID,
    name: SITE_NAME,
    alternateName: [...ORGANISATION.alternateNames, ORGANISATION.legalName],
    legalName: ORGANISATION.legalName,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    slogan: "Innovate, Automate, Dominate",
    foundingDate: ORGANISATION.foundingDate,
    email: ORGANISATION.email,
    logo: { "@type": "ImageObject", "@id": LOGO_ID, url: absoluteUrl("/logo.png"), caption: SITE_NAME },
    image: { "@id": LOGO_ID },
    address,
    // The Student Branch the chapter belongs to, and the society it is a chapter of.
    parentOrganization: { "@type": "Organization", ...PARENT_ORGANISATION },
    memberOf: [
      { "@type": "Organization", ...IEEE_COMPUTER_SOCIETY },
      { "@type": "CollegeOrUniversity", ...HOST_INSTITUTE },
    ],
    sameAs: SOCIAL_PROFILES,
    knowsAbout: TOPICS,
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "general enquiries",
      email: ORGANISATION.email,
      areaServed: "LK",
      availableLanguage: ["en", "si", "ta"],
    },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: SITE_SHORT_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": ORGANISATION_ID },
    inLanguage: "en",
  };
}

type PageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";

export function webPageSchema({
  path,
  name,
  description,
  type = "WebPage",
  image,
}: {
  path: string;
  name: string;
  description: string;
  type?: PageType;
  image?: string;
}) {
  return {
    "@type": type,
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description: truncate(description, 300),
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANISATION_ID },
    ...(image ? { primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(image) } } : {}),
    breadcrumb: { "@id": `${absoluteUrl(path)}#breadcrumb` },
    inLanguage: "en",
  };
}

/** Home is always the first crumb, so callers pass only the trail below it. */
export function breadcrumbSchema(path: string, trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(path)}#breadcrumb`,
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** Google needs name, startDate and location before an Event is eligible for rich results. */
export function eventSchema(event: Event) {
  const url = absoluteUrl(`/events/${event.slug}`);
  return {
    "@type": "Event",
    "@id": `${url}#event`,
    name: event.title,
    description: truncate(event.text.join(" "), 500),
    startDate: event.date,
    endDate: event.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [event.coverImage, ...event.gallery].map((photo) => photo.src).filter((src, i, all) => all.indexOf(src) === i).slice(0, 6),
    url,
    location: {
      "@type": "Place",
      name: event.location || HOST_INSTITUTE.name,
      address: { "@type": "PostalAddress", addressLocality: "Colombo", addressCountry: "LK" },
    },
    organizer: { "@id": ORGANISATION_ID },
    performer: { "@id": ORGANISATION_ID },
    isAccessibleForFree: true,
    inLanguage: "en",
    mainEntityOfPage: { "@id": `${url}#webpage` },
    // A past event advertising open registration is a Search Console warning, so the
    // loader only keeps the link while the event is upcoming.
    ...(event.registrationLink
      ? {
          offers: {
            "@type": "Offer",
            url: event.registrationLink,
            price: "0",
            priceCurrency: "LKR",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function blogPostingSchema(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const words = [...(post.overview ?? []), ...post.sections.flatMap((section) => section.paragraphs)]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: truncate(post.title, 110),
    description: post.summary ? truncate(post.summary, 300) : undefined,
    image: [post.image.src],
    datePublished: post.date,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author,
      ...(post.authorImage ? { image: post.authorImage.src } : {}),
    },
    publisher: { "@id": ORGANISATION_ID },
    mainEntityOfPage: { "@id": `${url}#webpage` },
    isPartOf: { "@id": `${absoluteUrl("/blog")}#blog` },
    articleSection: post.badge,
    wordCount: words,
    inLanguage: "en",
    // The full article lives on the chapter's Medium publication.
    ...(post.readMoreUrl ? { isBasedOn: post.readMoreUrl, sameAs: post.readMoreUrl } : {}),
  };
}

export function blogSchema(posts: BlogPost[]) {
  return {
    "@type": "Blog",
    "@id": `${absoluteUrl("/blog")}#blog`,
    name: `${SITE_SHORT_NAME} Blog`,
    description: "StackMedium winning articles written by IIT undergraduates.",
    url: absoluteUrl("/blog"),
    publisher: { "@id": ORGANISATION_ID },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${absoluteUrl(`/blog/${post.slug}`)}#article`,
      headline: truncate(post.title, 110),
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.date,
      image: post.cardImage.src,
      author: { "@type": "Person", name: post.author },
    })),
  };
}

export function eventListSchema(events: Event[]) {
  return {
    "@type": "ItemList",
    name: `Events by ${SITE_NAME}`,
    numberOfItems: events.length,
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/events/${event.slug}`),
      name: event.title,
    })),
  };
}

export function teamSchema(groups: { name: string; members: TeamMember[] }[]) {
  return groups.map((group) => ({
    "@type": "ItemList",
    name: group.name,
    itemListElement: group.members.map((member, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: member.name,
        jobTitle: member.role,
        image: absoluteUrl(member.image),
        sameAs: [member.linkedin],
        worksFor: { "@id": ORGANISATION_ID },
      },
    })),
  }));
}

/** Wraps nodes in one @graph, so a page's nodes stay one connected graph. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
