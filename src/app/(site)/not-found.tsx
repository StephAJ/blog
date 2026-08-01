import Link from "next/link";

import { PostCard } from "@/components/post/post-card";
import type { CardPost } from "@/components/post/types";
import { getRecentPosts } from "@/db/queries";

export default async function NotFound() {
  const recent = await getRecentPosts(3);

  return (
    <div className="container-page py-20 lg:py-28">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-7xl font-extrabold text-accent">404</p>
        <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">
          That page has wandered off
        </h1>
        <p className="mt-3 leading-relaxed text-body">
          The link may be out of date, or the post may have been renamed. Here is
          what is worth reading instead.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Back home
          </Link>
          <Link
            href="/archive"
            className="rounded-lg border hairline px-5 py-2.5 text-sm font-semibold transition hover:border-brand-500 hover:text-accent"
          >
            Browse the archive
          </Link>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((post) => (
            <PostCard key={post.id} post={post as CardPost} />
          ))}
        </div>
      )}
    </div>
  );
}
