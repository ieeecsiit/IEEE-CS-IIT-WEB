import type { Metadata } from "next";
import { BlogList } from "@/app/_components/blog-list";
import { Container, SectionTitle } from "@/app/_components/container";
import { JsonLd } from "@/app/_components/json-ld";
import { PageHeader } from "@/app/_components/page-header";
import { getBlogPosts } from "@/app/_data/blogs";
import { blogSchema, breadcrumbSchema, graph, webPageSchema } from "@/app/_lib/jsonld";
import { pageMetadata } from "@/app/_lib/seo";

const description =
  "StackMedium winning articles written by IIT undergraduates: monthly technical writing on AI, robotics, software and the future of computing, from the IEEE Computer Society Student Branch Chapter of IIT.";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description,
  path: "/blog",
  keywords: ["StackMedium", "student tech blog", "IIT blog"],
});

export const revalidate = 300;

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/blog", name: "Blog", description, type: "CollectionPage" }),
          breadcrumbSchema("/blog", [{ name: "Blog", path: "/blog" }]),
          blogSchema(blogPosts),
        )}
      />
      <PageHeader title="blog" />
      <section className="pt-[150px]">
        <Container>
          <SectionTitle>Our Blogs</SectionTitle>
          <BlogList posts={blogPosts} />
        </Container>
      </section>
    </>
  );
}
