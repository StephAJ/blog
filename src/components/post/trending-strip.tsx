import { TrendingUp } from "lucide-react";
import Link from "next/link";

import type { CardPost } from "./types";

export function TrendingStrip({ posts }: { posts: CardPost[] }) {
  if (!posts.length) return null;

  return (
    <section
      aria-label="Trending posts"
      className="border-y hairline surface-subtle"
    >
      <div className="container-page flex items-center gap-4 py-2.5">
        <span className="eyebrow flex shrink-0 items-center gap-1.5 text-accent">
          <TrendingUp size={14} />
          <span className="hidden sm:inline">Trending</span>
        </span>

        <ul className="no-scrollbar flex flex-1 items-center gap-6 overflow-x-auto">
          {posts.map((post, index) => (
            <li key={post.id} className="flex shrink-0 items-center gap-2">
              <span
                aria-hidden
                className="text-xs font-bold text-[var(--border-strong)]"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <Link
                href={`/${post.slug}`}
                className="link-underline text-sm font-medium whitespace-nowrap transition hover:text-accent"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
