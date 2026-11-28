import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/app/_data/types";
import { Reveal } from "./reveal";
import { SiteImage } from "./site-image";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="mt-[50px] grid grid-cols-1 gap-10">
      {posts.map((post) => (
        <Reveal key={post.slug} from="bottom">
          <Link
            href={`/blog/${post.slug}`}
            className="group flex items-center rounded-[20px] border border-line p-[30px] transition-[border-color,box-shadow] duration-500 hover:border-brand hover:shadow-[0_18px_50px_-24px_rgba(255,163,0,0.55)] max-sm:block max-sm:p-5"
          >
            <div className="flex-1 max-sm:mb-5">
              {post.badge && (
                <div className="inline-block rounded-full bg-brand px-5 py-2.5 leading-none font-medium text-ink">{post.badge}</div>
              )}
              <h3 className="mt-5 mb-0 w-4/5 text-[clamp(1.9rem,3.4vw,3.2rem)] leading-[1.08] font-extralight tracking-[-0.025em] text-ink max-md:w-full">
                {post.title}
              </h3>
              <div className="mt-5 flex w-1/5 border-t border-line pt-5 max-md:w-1/2 max-sm:w-full">
                {post.authorImage && (
                  <Image
                    src={post.authorImage.src}
                    alt={post.author}
                    width={post.authorImage.width}
                    height={post.authorImage.height}
                    sizes="55px"
                    className="mr-2.5 size-[55px] flex-none rounded-full border-[3px] border-ink object-cover"
                  />
                )}
                <div className="flex size-[55px] flex-none items-center justify-center rounded-full bg-ink transition duration-300 group-hover:bg-brand">
                  <SiteImage src="/images/bend-up-right-light.webp" alt="" sizes="25px" className="w-[25px]" />
                </div>
              </div>
            </div>
            <Reveal from="grow" className="ml-auto w-[390px] overflow-hidden rounded-[12px] xl:w-[420px] max-md:w-[300px] max-sm:w-full">
              <Image
                src={post.cardImage.src}
                alt=""
                width={post.cardImage.width}
                height={post.cardImage.height}
                sizes="(max-width: 767px) 100vw, 420px"
                className="w-full rounded-[12px] transition-transform duration-[900ms] ease-out-quart group-hover:scale-[1.03]"
              />
            </Reveal>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
