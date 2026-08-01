import Link from "next/link";

import type { CardAuthor } from "./types";
import { AuthorAvatar } from "./post-meta";

export function AuthorCard({ author }: { author: CardAuthor }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border hairline surface-subtle p-6 sm:flex-row sm:items-start">
      <AuthorAvatar author={author} size={64} className="size-16" />
      <div>
        <p className="eyebrow text-faint">Written by</p>
        <h2 className="mt-1 text-lg font-bold">
          <Link href={`/author/${author.slug}`} className="transition hover:text-accent">
            {author.name}
          </Link>
        </h2>
        {author.bio && (
          <p className="mt-2 text-sm leading-relaxed text-body">{author.bio}</p>
        )}
        <Link
          href={`/author/${author.slug}`}
          className="mt-3 inline-block text-sm font-semibold text-accent transition hover:underline"
        >
          More from {author.name.split(" ")[0]} →
        </Link>
      </div>
    </section>
  );
}
