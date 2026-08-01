import { Clock, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn, colorFromString, formatDate, initials, isoDate } from "@/lib/utils";

import type { CardAuthor } from "./types";

export function AuthorAvatar({
  author,
  size = 28,
  className,
}: {
  author: CardAuthor;
  size?: number;
  className?: string;
}) {
  if (author.avatarUrl) {
    return (
      <Image
        src={author.avatarUrl}
        alt={author.name}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        backgroundColor: colorFromString(author.name),
        fontSize: size * 0.4,
      }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold text-white",
        className,
      )}
    >
      {initials(author.name)}
    </span>
  );
}

export function PostMeta({
  author,
  publishedAt,
  readingMinutes,
  views,
  showAvatar = true,
  className,
}: {
  author?: CardAuthor;
  publishedAt: Date | null;
  readingMinutes?: number;
  views?: number;
  showAvatar?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.8125rem] text-faint",
        className,
      )}
    >
      {author && (
        <Link
          href={`/author/${author.slug}`}
          className="flex items-center gap-2 font-medium text-body transition hover:text-accent"
        >
          {showAvatar && <AuthorAvatar author={author} size={24} />}
          {author.name}
        </Link>
      )}

      {publishedAt && (
        <>
          {author && <span aria-hidden>·</span>}
          <time dateTime={isoDate(publishedAt)}>{formatDate(publishedAt, "short")}</time>
        </>
      )}

      {typeof readingMinutes === "number" && (
        <>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} />
            {readingMinutes} min read
          </span>
        </>
      )}

      {typeof views === "number" && views > 0 && (
        <>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Eye size={13} />
            {Intl.NumberFormat("en", { notation: "compact" }).format(views)}
          </span>
        </>
      )}
    </div>
  );
}
