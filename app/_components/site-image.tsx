import Image, { type ImageProps } from "next/image";
import imageSizes from "@/app/_data/image-sizes.json";

const sizes: Record<string, number[]> = imageSizes;

type SiteImageProps = Omit<ImageProps, "src" | "width" | "height"> & { src: string };

/** next/image with intrinsic dimensions looked up from the generated manifest (`npm run images`). */
export function SiteImage({ src, alt, ...props }: SiteImageProps) {
  const dimensions = sizes[src];
  if (!dimensions) throw new Error(`Unknown image "${src}". Run \`npm run images\` after adding it.`);
  const [width, height] = dimensions;
  return <Image src={src} alt={alt} width={width} height={height} {...props} />;
}
