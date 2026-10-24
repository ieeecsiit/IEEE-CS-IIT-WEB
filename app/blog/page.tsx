import type { Metadata } from "next";
import { BlogList } from "@/app/_components/blog-list";
import { Container, SectionTitle } from "@/app/_components/container";
import { PageHeader } from "@/app/_components/page-header";
import { getBlogPosts } from "@/app/_data/blogs";

export const metadata: Metadata = {
  title: "Blog",
  description: "StackMedium winning articles written by IIT undergraduates.",
};

export const revalidate = 300;

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <>
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
