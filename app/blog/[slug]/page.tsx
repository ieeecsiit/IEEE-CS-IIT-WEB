import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/app/_components/container";
import { PageHeader } from "@/app/_components/page-header";
import { SiteImage } from "@/app/_components/site-image";
import { blogPosts, getBlogPost } from "@/app/_data/blogs";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost((await params).slug);
  if (!post) return {};
  const description = post.sections[0]?.paragraphs[0];
  return {
    title: post.title,
    description,
    authors: [{ name: post.author }],
    openGraph: { type: "article", title: post.title, description, images: [post.image] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();

  return (
    <>
      <PageHeader title="Our Blogs" />
      <section className="py-[50px]">
        <Container>
          <div className="grid grid-cols-2 gap-5 xl:gap-[50px] max-md:grid-cols-1 max-md:gap-[30px]">
            <div>
              <div className="sticky top-2.5">
                <div className="rounded-[5px] border border-line px-[30px] pt-[30px] pb-10">
                  <div className="mb-5">
                    <span className="inline-block border border-brand px-5 py-2.5 text-black">{post.badge}</span>
                  </div>
                  <h2 className="m-0 text-[50px] leading-[50px] font-semibold text-black uppercase max-xs:text-[40px] max-xs:leading-10">
                    {post.title}
                  </h2>
                </div>
                <SiteImage
                  src={post.image}
                  alt={post.imageAlt}
                  priority
                  sizes="(max-width: 991px) 100vw, 50vw"
                  className="w-full"
                />
              </div>
            </div>
            <article className="rounded-[5px] border border-line p-[30px] text-black max-xs:p-5">
              <blockquote className="mt-[26px] mb-9">By {post.author}</blockquote>
              {post.sections.map((section) => (
                <section key={section.heading} className="mb-[26px]">
                  {section.heading && <h4>{section.heading}</h4>}
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="mb-[26px] last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
              <a
                href={post.mediumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-[5px] bg-brand px-5 py-2.5 text-base font-medium text-white transition-colors duration-300 hover:bg-black"
              >
                Read More
              </a>
            </article>
          </div>
        </Container>
      </section>
    </>
  );
}
