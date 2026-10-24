import type { Metadata } from "next";
import { BlogList } from "@/app/_components/blog-list";
import { Container, SectionTitle } from "@/app/_components/container";
import { PageHeader } from "@/app/_components/page-header";
import { blogPosts } from "@/app/_data/blogs";

export const metadata: Metadata = {
  title: "Blog",
  description: "StackMedium winning articles written by IIT undergraduates.",
};

export default function BlogPage() {
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
