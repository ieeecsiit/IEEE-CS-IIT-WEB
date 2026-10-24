import { getBlogPosts } from "@/app/_data/blogs";
import { getEvents } from "@/app/_data/events";
import { executiveCommittee, standingCommittee } from "@/app/_data/team";
import type { BlogPost, Event } from "@/app/_data/types";
import {
  HOST_INSTITUTE,
  IEEE_COMPUTER_SOCIETY,
  ORGANISATION,
  PARENT_ORGANISATION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
  absoluteUrl,
} from "./seo";

/**
 * Builds /llms.txt and /llms-full.txt, following the llmstxt.org convention.
 *
 * Where robots.txt says what a crawler may fetch, these say what the chapter is and where
 * the substance lives. An assistant asked "what does IEEE CS IIT do" should be able to answer
 * from llms.txt alone; llms-full.txt adds the text of every event and post.
 */

/** Null for an empty section, so it drops out without breaking the blank lines between blocks. */
const section = (title: string, lines: string[]) => (lines.length ? `## ${title}\n\n${lines.join("\n")}` : null);

/** The event and post lists are a bonus; a CMS outage should shorten the file, not break it. */
async function orEmpty<T>(load: () => Promise<T[]>): Promise<T[]> {
  try {
    return await load();
  } catch {
    return [];
  }
}

const eventLine = (event: Event) =>
  `- [${event.title}](${absoluteUrl(`/events/${event.slug}`)}): ${event.dateLabel}${event.location ? `, ${event.location}` : ""}.${event.summary ? ` ${event.summary}` : ""}`;

const postLine = (post: BlogPost) =>
  `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)}): by ${post.author}${post.badge ? ` (StackMedium ${post.badge})` : ""}.`;

function eventText(event: Event) {
  return [
    `### ${event.title}`,
    `URL: ${absoluteUrl(`/events/${event.slug}`)}\nDate: ${event.dateLabel}${event.location ? `\nLocation: ${event.location}` : ""}`,
    ...event.text,
  ].join("\n\n");
}

function postText(post: BlogPost) {
  return [
    `### ${post.title}`,
    `URL: ${absoluteUrl(`/blog/${post.slug}`)}\nAuthor: ${post.author}${post.badge ? `\nAward: StackMedium ${post.badge}` : ""}${post.readMoreUrl ? `\nFull article: ${post.readMoreUrl}` : ""}`,
    ...(post.overview ?? []),
    ...post.sections.flatMap((part) => [...(part.heading ? [`#### ${part.heading}`] : []), ...part.paragraphs]),
  ].join("\n\n");
}

export async function buildLlmsTxt({ full }: { full: boolean }) {
  const [events, posts] = await Promise.all([orEmpty(getEvents), orEmpty(getBlogPosts)]);

  const blocks = [
    `# ${SITE_NAME}`,
    `> ${SITE_DESCRIPTION}`,
    `The IEEE Computer Society Student Branch Chapter of IIT is the Computer Society chapter of the ${PARENT_ORGANISATION.name} (${PARENT_ORGANISATION.url}), at the ${HOST_INSTITUTE.name} in Colombo, Sri Lanka. Founded in ${ORGANISATION.foundingDate}, it has 500+ members, has completed 20+ projects and reached 5,000+ delegates. Its flagship programmes include CodeRally (a national competitive programming challenge and 24-hour hackathon), IndustPro (career and industry readiness workshops), WebSpire (web development workshops), Commit.dev (member meetups) and StackMedium (a monthly technical writing contest published on Medium). Motto: Innovate, Automate, Dominate.`,
    section("Key pages", [
      `- [Home](${SITE_URL}/): Overview, milestones, recent events and blog posts, and how to join.`,
      `- [About us](${absoluteUrl("/about")}): Mission, vision and the current committee.`,
      `- [Events](${absoluteUrl("/events")}): Every event the chapter has run, with descriptions and photographs.`,
      `- [Blog](${absoluteUrl("/blog")}): StackMedium winning articles by IIT undergraduates.`,
      `- [Contact](${absoluteUrl("/contact")}): Address, email and a contact form.`,
      ...(full ? [] : [`- [Full text](${absoluteUrl("/llms-full.txt")}): Every event and blog post in full.`]),
    ]),
    section(
      "Current committee",
      [...executiveCommittee, ...standingCommittee].map((member) => `- ${member.name}: ${member.role}`),
    ),
    full ? section("Events", events.map(eventText)) : section("Events", events.map(eventLine)),
    full ? section("Blog posts", posts.map(postText)) : section("Blog posts", posts.map(postLine)),
    section("Contact", [
      `- Email: ${ORGANISATION.email}`,
      `- Address: ${ORGANISATION.address.streetAddress}, ${ORGANISATION.address.addressLocality} ${ORGANISATION.address.postalCode}, Sri Lanka`,
      ...SOCIAL_PROFILES.map((url) => `- ${url}`),
    ]),
    section("Optional", [
      `- [Sitemap](${absoluteUrl("/sitemap.xml")}): Every indexable URL.`,
      `- [${PARENT_ORGANISATION.name}](${PARENT_ORGANISATION.url}): The Student Branch this chapter belongs to.`,
      `- [${IEEE_COMPUTER_SOCIETY.name}](${IEEE_COMPUTER_SOCIETY.url}): The parent society.`,
      `- [${HOST_INSTITUTE.name}](${HOST_INSTITUTE.url}): The host institute.`,
    ]),
  ];

  const body = `${blocks.filter((block): block is string => block !== null).join("\n\n")}\n`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
