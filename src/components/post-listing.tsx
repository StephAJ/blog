import { AdSlot } from "@/components/ads/ad-slot";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post/post-card";
import type { CardPost } from "@/components/post/types";
import { Sidebar } from "@/components/sidebar/sidebar";

export function PostListing({
  title,
  description,
  accent,
  crumbs,
  posts,
  page,
  totalPages,
  total,
  hrefFor,
  emptyMessage = "Nothing here yet.",
  children,
}: {
  title: string;
  description?: string | null;
  accent?: string;
  crumbs: Crumb[];
  posts: CardPost[];
  page: number;
  totalPages: number;
  total: number;
  hrefFor: (page: number) => string;
  emptyMessage?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs items={crumbs} />

      <header
        className="mt-6 border-b hairline pb-8"
        style={accent ? { borderBottomColor: accent } : undefined}
      >
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl leading-relaxed text-body">{description}</p>
        )}
        <p className="mt-4 text-sm text-faint">
          {total} {total === 1 ? "post" : "posts"}
        </p>
        {children}
      </header>

      <AdSlot placement="header" className="mt-8" />

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">
          {posts.length === 0 ? (
            <p className="rounded-xl border border-dashed hairline px-6 py-16 text-center text-sm text-faint">
              {emptyMessage}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {posts.map((post, index) => (
                <PostCard key={post.id} post={post} priority={index < 2} />
              ))}
            </div>
          )}

          <Pagination
            className="mt-12"
            page={page}
            totalPages={totalPages}
            hrefFor={hrefFor}
          />
        </div>

        <Sidebar className="lg:col-span-4" />
      </div>
    </div>
  );
}
