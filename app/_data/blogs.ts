import "server-only";

import { fetchCollection, toPhoto, withoutBlankParagraphs, type CmsMedia } from "./cms";
import type { BlogPost, BlogSection } from "./types";

/** Cache tag on the blog list; `/api/revalidate` clears it when the CMS changes. */
export const BLOGS_TAG = "cms-blogs";

// Subset of the CMS's generated `Blog` type that this site reads.
type CmsBlog = {
  slug: string;
  title: string;
  publishedDate?: string | null;
  badge?: string | null;
  excerpt?: string | null;
  author: { name: string; image?: number | CmsMedia | null };
  coverImage: number | CmsMedia;
  cardImage?: number | CmsMedia | null;
  contentHtml: string;
  sections: BlogSection[];
  readMoreUrl?: string | null;
};

function toPost(blog: CmsBlog): BlogPost | undefined {
  const image = toPhoto(blog.coverImage, blog.title);
  if (!image) return undefined;
  return {
    slug: blog.slug,
    title: blog.title,
    date: blog.publishedDate ?? new Date(0).toISOString(),
    badge: blog.badge ?? undefined,
    author: blog.author.name,
    authorImage: toPhoto(blog.author.image, blog.author.name),
    cardImage: toPhoto(blog.cardImage, blog.title) ?? image,
    image,
    summary: blog.excerpt?.trim() || blog.sections[0]?.paragraphs[0],
    // The excerpt doubles as the post's intro, shown under an "Overview" heading.
    overview: blog.excerpt
      ?.split(/\n\s*\n/)
      .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
      .filter(Boolean),
    html: withoutBlankParagraphs(blog.contentHtml),
    readMoreUrl: blog.readMoreUrl ?? undefined,
  };
}

/** Published CMS posts, newest first. */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const docs = await fetchCollection<CmsBlog>(
    "blogs",
    { sort: "-publishedDate", depth: "1", limit: "100" },
    BLOGS_TAG,
    "blog posts",
  );
  return docs.map(toPost).filter((post): post is BlogPost => !!post);
}

export async function getBlogPost(slug: string) {
  return (await getBlogPosts()).find((post) => post.slug === slug);
}
