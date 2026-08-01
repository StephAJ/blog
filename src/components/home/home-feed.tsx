import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/ad-slot";
import { Pagination } from "@/components/pagination";
import { FeaturedHero } from "@/components/post/featured-hero";
import { PostCard } from "@/components/post/post-card";
import { TrendingStrip } from "@/components/post/trending-strip";
import type { CardPost } from "@/components/post/types";
import { SectionHeading } from "@/components/section-heading";
import { Sidebar } from "@/components/sidebar/sidebar";
import { getFeaturedPosts, getPopularPosts, getPosts } from "@/db/queries";
import { getSettings } from "@/lib/settings";

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
      {settings.trendingEnabled && <TrendingStrip posts={trending as CardPost[]} />}

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

          {/* Deliberately not sticky: the sidebar is far taller than a
              viewport, and a sticky element that tall makes its own lower
              half impossible to scroll to. */}
          <Sidebar className="lg:col-span-4" />
        </div>
      </div>
    </>
  );
}
