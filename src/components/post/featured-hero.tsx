import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CategoryBadge } from "./category-badge";
import { PostCardHorizontal } from "./post-card";
import { PostMeta } from "./post-meta";
import type { CardPost } from "./types";

export function FeaturedHero({ posts }: { posts: CardPost[] }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;

  return (
    <section aria-label="Featured" className="grid gap-6 lg:grid-cols-5">
      <article className="group relative overflow-hidden rounded-2xl lg:col-span-3">
        <div className="relative aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
          {lead.coverImage ? (
            <Image
              src={lead.coverImage}
              alt={lead.coverAlt ?? ""}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="block size-full bg-linear-to-br from-brand-500 to-brand-800" />
          )}
          <span
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-ink-950/90 via-ink-950/35 to-transparent"
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          {lead.category && (
            <CategoryBadge
              category={lead.category}
              variant="solid"
              className="relative z-10 mb-3"
            />
          )}
          <h2 className="text-2xl leading-[1.15] font-extrabold text-white sm:text-3xl lg:text-[2.1rem]">
            {/* Pseudo-element covers the card so the whole thing is clickable
                without nesting the other links inside this one. */}
            <Link href={`/${lead.slug}`} className="after:absolute after:inset-0">
              {lead.title}
            </Link>
          </h2>
          {lead.excerpt && (
            <p className="clamp-2 mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
              {lead.excerpt}
            </p>
          )}
          <PostMeta
            className="relative z-10 mt-4 [&_*]:text-white/70 [&_a:hover]:text-white"
            author={lead.author}
            publishedAt={lead.publishedAt}
            readingMinutes={lead.readingMinutes}
          />
        </div>
      </article>

      <div className="flex flex-col gap-5 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="eyebrow text-faint">Editor&rsquo;s picks</h2>
          <Link
            href="/archive"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition hover:gap-1.5"
          >
            All posts <ArrowRight size={13} />
          </Link>
        </div>

        <div className="flex flex-col gap-5">
          {rest.slice(0, 4).map((post) => (
            <PostCardHorizontal
              key={post.id}
              post={post}
              className="border-b hairline pb-5 last:border-b-0 last:pb-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
