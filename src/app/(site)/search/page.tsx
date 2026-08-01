import { Search } from "lucide-react";
import type { Metadata } from "next";

import { PostListing } from "@/components/post-listing";
import type { CardPost } from "@/components/post/types";
import { getPosts } from "@/db/queries";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every published post.",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", page: pageParam } = await searchParams;
  const term = q.trim();
  const settings = await getSettings();
  const page = Math.max(1, Number(pageParam) || 1);

  const feed = term
    ? await getPosts({ page, perPage: settings.postsPerPage, search: term })
    : { items: [], page: 1, totalPages: 1, total: 0 };

  return (
    <PostListing
      title={term ? `Results for “${term}”` : "Search"}
      description={term ? null : "Type a few words to search every published post."}
      crumbs={[{ label: "Search" }]}
      posts={feed.items as CardPost[]}
      page={feed.page}
      totalPages={feed.totalPages}
      total={feed.total}
      hrefFor={(target) =>
        `/search?q=${encodeURIComponent(term)}${target > 1 ? `&page=${target}` : ""}`
      }
      emptyMessage={
        term
          ? `No posts match “${term}”. Try a broader term.`
          : "Enter a search term above."
      }
    >
      <form action="/search" method="get" role="search" className="mt-5 max-w-lg">
        <label htmlFor="site-search" className="sr-only">
          Search posts
        </label>
        <div className="flex items-center gap-2 rounded-lg border hairline surface px-3.5 focus-within:border-brand-500">
          <Search size={17} className="shrink-0 text-faint" />
          <input
            id="site-search"
            name="q"
            defaultValue={term}
            placeholder="Search articles…"
            className="w-full bg-transparent py-3 text-sm outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Search
          </button>
        </div>
      </form>
    </PostListing>
  );
}
