import NextImage, { type ImageProps } from "next/image";

/**
 * `next/image`, but anything served out of /uploads skips the optimizer.
 *
 * The upload route already re-encodes to WebP and caps width at 1920px, so
 * a second pass through /_next/image buys nothing — it only adds first-hit
 * latency (which reads as "the image takes a while to appear") and a failure
 * mode where a broken optimizer leaves a broken image on the page.
 */
export function SmartImage({ src, unoptimized, ...props }: ImageProps) {
  const isLocalUpload = typeof src === "string" && src.startsWith("/uploads/");

  return <NextImage src={src} unoptimized={unoptimized ?? isLocalUpload} {...props} />;
}
