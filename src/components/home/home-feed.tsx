import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/ad-slot";
import { Pagination } from "@/components/pagination";
import { FeaturedHero } from "@/components/post/featured-hero";
import { PostCard } from "@/components/post/post-card";
import { TrendingStrip } from "@/components/post/trending-strip";
import type { CardPost } from "@/components/post/types";
import { SectionHeading } from "@/components/section-heading";
import { Sidebar } from "@/components/sidebar/sidebar";
import {
  getCategoriesWithCounts,
  getFeaturedPosts,
  getPopularPosts,
  getPosts,
} from "@/db/queries";
import { getSettings } from "@/lib/settings";
import { hexToRgba } from "@/lib/utils";

export async function HomeFeed({ page }: { page: number }) {
  const settings = await getSettings();
  const [featured, trending] = await Promise.all([
    getFeaturedPosts(5),
    getPopularPosts(6),
  ]);

  const featuredIds = featured.map((post) => post.id);
  const feed = await getPosts({
    page,
    perPage: settings.postsPerPage,
    excludeIds: featuredIds,
  });

  if (page > 1 && feed.items.length === 0) notFound();

  const isFirstPage = page === 1;

  return (
    <>
      {isFirstPage && <TrendingStrip posts={trending as CardPost[]} />}

      <div className="container-page py-10 lg:py-14">
        {isFirstPage && featured.length > 0 && (
          <FeaturedHero posts={featured as CardPost[]} />
        )}

        <AdSlot placement="header" className="mt-10" />

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <SectionHeading
              as={isFirstPage ? "h2" : "h1"}
              title={isFirstPage ? "Latest posts" : `Latest posts — page ${page}`}
              description={
                isFirstPage
                  ? "Everything published, newest first."
                  : undefined
              }
              href="/archive"
              linkLabel="Browse archive"
            />

            {feed.items.length === 0 ? (
              <p className="rounded-xl border border-dashed hairline px-6 py-14 text-center text-sm text-faint">
                No posts published yet. Sign in to the admin panel to write the first
                one.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {feed.items.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post as CardPost}
                    priority={isFirstPage && index < 2}
                  />
                ))}
              </div>
            )}

            <Pagination
              className="mt-12"
              page={feed.page}
              totalPages={feed.totalPages}
              hrefFor={(target) => (target === 1 ? "/" : `/page/${target}`)}
            />
          </div>

          <Sidebar className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start" />
        </div>

        {isFirstPage && <CategoryShowcase />}
      </div>
    </>
  );
}

async function CategoryShowcase() {
  const categories = (await getCategoriesWithCounts()).filter((c) => c.count > 0);
  if (categories.length === 0) return null;

  return (
    <section className="mt-16 lg:mt-20">
      <SectionHeading
        title="Browse by topic"
        description="Nine subjects, one archive. Pick a thread and pull."
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/category/${category.slug}`}
              className="card-hover group flex h-full flex-col rounded-xl border hairline surface p-5"
              style={{ borderTop: `3px solid ${category.color}` }}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold transition group-hover:text-accent">
                  {category.name}
                </h3>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: hexToRgba(category.color, 0.13),
                    color: category.color,
                  }}
                >
                  {category.count}
                </span>
              </div>
              {category.description && (
                <p className="clamp-2 mt-2 text-sm leading-relaxed text-body">
                  {category.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
