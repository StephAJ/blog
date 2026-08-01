import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CategoryBadge } from "@/components/post/category-badge";
import type { CardPost } from "@/components/post/types";
import { SectionHeading } from "@/components/section-heading";
import {
  getCategoriesWithCounts,
  getPosts,
  getTagsWithCounts,
} from "@/db/queries";
import { getSettings } from "@/lib/settings";
import { formatDate, hexToRgba, isoDate } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Archive",
    description: `Every post published on ${settings.siteName}, newest first.`,
    alternates: { canonical: "/archive" },
  };
}

function groupByYear(posts: CardPost[]) {
  const groups = new Map<string, CardPost[]>();
  for (const post of posts) {
    const year = post.publishedAt
      ? String(post.publishedAt.getFullYear())
      : "Undated";
    const bucket = groups.get(year);
    if (bucket) bucket.push(post);
    else groups.set(year, [post]);
  }
  return [...groups.entries()];
}

export default async function ArchivePage() {
  const [feed, categories, tags] = await Promise.all([
    getPosts({ page: 1, perPage: 500 }),
    getCategoriesWithCounts(),
    getTagsWithCounts(),
  ]);

  const grouped = groupByYear(feed.items as CardPost[]);
  const activeCategories = categories.filter((c) => c.count > 0);
  const activeTags = tags.filter((t) => t.count > 0);

  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Archive" }]} />

      <header className="mt-6 border-b hairline pb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Archive</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-body">
          Every post, newest first — {feed.total} in total.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {grouped.map(([year, posts]) => (
            <section key={year} className="mb-12 last:mb-0">
              <h2 className="mb-5 text-2xl font-extrabold text-faint">{year}</h2>
              <ul className="divide-y hairline border-y hairline">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/${post.slug}`}
                      className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3.5 transition"
                    >
                      <time
                        dateTime={isoDate(post.publishedAt)}
                        className="w-24 shrink-0 font-mono text-xs text-faint"
                      >
                        {formatDate(post.publishedAt, "short")}
                      </time>
                      <span className="flex-1 font-semibold transition group-hover:text-accent">
                        {post.title}
                      </span>
                      {post.category && (
                        <span
                          className="eyebrow rounded-full px-2 py-0.5"
                          style={{
                            backgroundColor: hexToRgba(post.category.color, 0.12),
                            color: post.category.color,
                          }}
                        >
                          {post.category.name}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="space-y-10 lg:col-span-4">
          <section>
            <SectionHeading title="Categories" className="mb-5" />
            <ul className="space-y-2">
              {activeCategories.map((category) => (
                <li key={category.slug} className="flex items-center justify-between">
                  <CategoryBadge
                    category={{
                      id: category.id,
                      name: category.name,
                      slug: category.slug,
                      color: category.color,
                    }}
                  />
                  <span className="text-xs text-faint">{category.count} posts</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading title="Tags" className="mb-5" />
            <ul className="flex flex-wrap gap-2">
              {activeTags.map((tag) => (
                <li key={tag.slug}>
                  <Link
                    href={`/tag/${tag.slug}`}
                    className="inline-block rounded-full border hairline px-3 py-1.5 text-xs font-medium text-body transition hover:border-brand-500 hover:text-accent"
                  >
                    {tag.name}
                    <span className="ml-1.5 text-faint">{tag.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
