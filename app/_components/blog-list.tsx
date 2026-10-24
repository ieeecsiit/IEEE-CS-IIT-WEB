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
            className="flex items-center rounded-[5px] border border-line p-[30px] transition-colors duration-300 hover:border-brand max-sm:block"
          >
            <div className="flex-1 max-sm:mb-5">
              {post.badge && (
                <div className="inline-block rounded-[10px] bg-brand px-5 py-2.5 font-medium text-white">{post.badge}</div>
              )}
              <h3 className="mt-5 mb-0 w-4/5 text-[40px] leading-11 font-extralight text-black uppercase xl:text-[50px] xl:leading-[55px] max-md:w-full">
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
                    className="mr-2.5 size-[55px] flex-none rounded-full border-[3px] border-[#333] object-cover"
                  />
                )}
                <div className="flex size-[55px] flex-none items-center justify-center rounded-full bg-[#333] transition duration-300 hover:scale-110 hover:bg-brand">
                  <SiteImage src="/images/bend-up-right-light.webp" alt="" sizes="25px" className="w-[25px]" />
                </div>
              </div>
            </div>
            <Reveal from="grow" className="ml-auto w-[390px] xl:w-[420px] max-md:w-[300px] max-sm:w-full">
              <Image
                src={post.cardImage.src}
                alt=""
                width={post.cardImage.width}
                height={post.cardImage.height}
                sizes="(max-width: 767px) 100vw, 420px"
                className="w-full rounded-[5px]"
              />
            </Reveal>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
