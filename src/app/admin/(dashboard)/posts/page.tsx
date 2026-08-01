import { ExternalLink, Eye, Pencil, Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SubmitButton } from "@/components/admin/submit-button";
import {
  AdminPageHeader,
  EmptyState,
  StatusPill,
  inputClass,
} from "@/components/admin/ui";
import { Pagination } from "@/components/pagination";
import { getAdminPosts } from "@/db/queries";
import { cn, formatDate, relativeTime } from "@/lib/utils";

import { togglePostStatus } from "../../actions/posts";

export const metadata: Metadata = { title: "Posts" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
};

const FILTERS = [
  { label: "All", value: "" },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "draft" },
] as const;

export default async function AdminPostsPage({ searchParams }: Props) {
  const { status, q = "", page: pageParam } = await searchParams;
  const activeStatus = status === "published" || status === "draft" ? status : undefined;
  const page = Math.max(1, Number(pageParam) || 1);

  const feed = await getAdminPosts({ status: activeStatus, search: q, page, perPage: 20 });

  function filterHref(value: string) {
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    if (q) params.set("q", q);
    const query = params.toString();
    return `/admin/posts${query ? `?${query}` : ""}`;
  }

  return (
    <>
      <AdminPageHeader
        title="Posts"
        description={`${feed.total} post${feed.total === 1 ? "" : "s"} in total.`}
        actions={
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus size={15} /> New post
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {FILTERS.map((filter) => (
            <Link
              key={filter.label}
              href={filterHref(filter.value)}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-semibold transition",
                (activeStatus ?? "") === filter.value
                  ? "bg-brand-600 text-white"
                  : "border hairline text-body hover:border-brand-500 hover:text-accent",
              )}
            >
              {filter.label}
            </Link>
          ))}
        </div>

        <form action="/admin/posts" className="flex items-center gap-2">
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search titles…"
              aria-label="Search posts"
              className={cn(inputClass, "w-56 pl-9")}
            />
          </div>
        </form>
      </div>

      {feed.items.length === 0 ? (
        <EmptyState
          title="No posts found"
          description={
            q ? `Nothing matches “${q}”.` : "Write your first post to get started."
          }
          action={
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <Plus size={15} /> New post
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border hairline surface">
          <table className="w-full min-w-[52rem] text-sm">
            <thead>
              <tr className="border-b hairline text-left">
                <th className="eyebrow px-5 py-3 text-faint">Title</th>
                <th className="eyebrow px-5 py-3 text-faint">Category</th>
                <th className="eyebrow px-5 py-3 text-faint">Status</th>
                <th className="eyebrow px-5 py-3 text-right text-faint">Views</th>
                <th className="eyebrow px-5 py-3 text-faint">Updated</th>
                <th className="eyebrow px-5 py-3 text-right text-faint">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {feed.items.map((post) => (
                <tr key={post.id} className="transition hover:surface-subtle">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-semibold transition hover:text-accent"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-xs text-faint">/{post.slug}</p>
                    <p className="mt-1 flex gap-2 text-xs text-faint">
                      {post.featured && <span className="text-accent">Featured</span>}
                      {post.pinned && <span className="text-accent">Pinned</span>}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    {post.category ? (
                      <span
                        className="eyebrow rounded-full px-2 py-1"
                        style={{
                          backgroundColor: `${post.category.color}20`,
                          color: post.category.color,
                        }}
                      >
                        {post.category.name}
                      </span>
                    ) : (
                      <span className="text-xs text-faint">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={post.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium">{post.views}</td>
                  <td className="px-5 py-3.5 text-xs text-faint">
                    {relativeTime(post.updatedAt)}
                    {post.publishedAt && (
                      <span className="mt-0.5 block">
                        Published {formatDate(post.publishedAt, "short")}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <form action={togglePostStatus}>
                        <input type="hidden" name="id" value={post.id} />
                        <SubmitButton
                          variant="secondary"
                          className="px-2.5 py-1.5 text-xs"
                          icon={<Eye size={13} />}
                        >
                          {post.status === "published" ? "Unpublish" : "Publish"}
                        </SubmitButton>
                      </form>
                      {post.status === "published" && (
                        <Link
                          href={`/${post.slug}`}
                          target="_blank"
                          aria-label={`View ${post.title}`}
                          className="grid size-8 place-items-center rounded-lg border hairline text-body transition hover:border-brand-500 hover:text-accent"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      )}
                      <Link
                        href={`/admin/posts/${post.id}`}
                        aria-label={`Edit ${post.title}`}
                        className="grid size-8 place-items-center rounded-lg border hairline text-body transition hover:border-brand-500 hover:text-accent"
                      >
                        <Pencil size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        className="mt-8"
        page={feed.page}
        totalPages={feed.totalPages}
        hrefFor={(target) => {
          const params = new URLSearchParams();
          if (activeStatus) params.set("status", activeStatus);
          if (q) params.set("q", q);
          if (target > 1) params.set("page", String(target));
          const query = params.toString();
          return `/admin/posts${query ? `?${query}` : ""}`;
        }}
      />
    </>
  );
}
