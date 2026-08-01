import { SmartImage as Image } from "@/components/smart-image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { CategoryBadge } from "./category-badge";
import { PostMeta } from "./post-meta";
import type { CardPost } from "./types";

const COVER_FALLBACK =
  "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-800))";

export function PostCard({
  post,
  priority = false,
  className,
}: {
  post: CardPost;
  priority?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "card-hover group flex flex-col overflow-hidden rounded-xl border hairline surface",
        className,
      )}
    >
      <Link
        href={`/${post.slug}`}
        className="relative block aspect-16/10 overflow-hidden surface-subtle"
        tabIndex={-1}
        aria-hidden
      >
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="block size-full" style={{ background: COVER_FALLBACK }} />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {post.category && <CategoryBadge category={post.category} className="self-start" />}

        <h3 className="mt-3 text-lg leading-snug font-bold">
          <Link
            href={`/${post.slug}`}
            className="clamp-2 transition group-hover:text-accent"
          >
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="clamp-3 mt-2.5 text-sm leading-relaxed text-body">
            {post.excerpt}
          </p>
        )}

        <PostMeta
          className="mt-auto pt-4"
          author={post.author}
          publishedAt={post.publishedAt}
          readingMinutes={post.readingMinutes}
        />
      </div>
    </article>
  );
}

/** Wide layout: image left, text right. Used in sidebars and list views. */
export function PostCardHorizontal({
  post,
  size = "md",
  className,
}: {
  post: CardPost;
  size?: "sm" | "md";
  className?: string;
}) {
  const imageWidth = size === "sm" ? "w-20" : "w-32 sm:w-40";

  return (
    <article className={cn("group flex gap-3.5", className)}>
      <Link
        href={`/${post.slug}`}
        tabIndex={-1}
        aria-hidden
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg surface-subtle",
          imageWidth,
          size === "sm" ? "aspect-square" : "aspect-4/3",
        )}
      >
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt=""
            fill
            sizes="160px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="block size-full" style={{ background: COVER_FALLBACK }} />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        {post.category && size === "md" && (
          <CategoryBadge category={post.category} className="mb-2" />
        )}
        <h3
          className={cn(
            "leading-snug font-bold",
            size === "sm" ? "text-sm" : "text-base",
          )}
        >
          <Link
            href={`/${post.slug}`}
            className="clamp-2 transition group-hover:text-accent"
          >
            {post.title}
          </Link>
        </h3>
        {size === "md" && post.excerpt && (
          <p className="clamp-2 mt-1.5 text-sm text-body">{post.excerpt}</p>
        )}
        <PostMeta
          className="mt-2"
          publishedAt={post.publishedAt}
          readingMinutes={size === "md" ? post.readingMinutes : undefined}
          showAvatar={false}
        />
      </div>
    </article>
  );
}

/** Numbered list item — used by the "Most read" widget. */
export function PostCardRanked({
  post,
  rank,
}: {
  post: CardPost;
  rank: number;
}) {
  return (
    <article className="group flex gap-3.5">
      <span
        aria-hidden
        className="w-7 shrink-0 pt-0.5 text-2xl leading-none font-extrabold text-[var(--border-strong)] transition group-hover:text-brand-500"
      >
        {String(rank).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm leading-snug font-bold">
          <Link
            href={`/${post.slug}`}
            className="clamp-2 transition group-hover:text-accent"
          >
            {post.title}
          </Link>
        </h3>
        <PostMeta
          className="mt-1.5"
          publishedAt={post.publishedAt}
          readingMinutes={post.readingMinutes}
          showAvatar={false}
        />
      </div>
    </article>
  );
}
