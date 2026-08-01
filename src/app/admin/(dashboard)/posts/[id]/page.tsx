import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostForm } from "@/components/admin/post-form";
import { AdminPageHeader, StatusPill } from "@/components/admin/ui";
import { db } from "@/db";
import { getAdminPost } from "@/db/queries";
import { categories } from "@/db/schema";
import { getSettings, siteUrl } from "@/lib/settings";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Edit post" };
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

/** `datetime-local` needs a local-time string, not a UTC ISO string. */
function toLocalDateTime(date: Date | null) {
  if (!date) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default async function EditPostPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { saved } = await searchParams;

  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const post = await getAdminPost(postId);
  if (!post) notFound();

  const settings = await getSettings();
  const categoryList = await db.select().from(categories).orderBy(categories.position);

  return (
    <>
      <AdminPageHeader
        title="Edit post"
        description={`Created ${formatDate(post.createdAt, "long")} · ${post.views} views`}
        actions={<StatusPill status={post.status} />}
      />

      <PostForm
        saved={saved === "1"}
        siteUrl={siteUrl(settings.siteUrl)}
        categories={categoryList}
        values={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImage: post.coverImage ?? "",
          coverAlt: post.coverAlt ?? "",
          categoryId: post.categoryId,
          tagList: post.postTags.map((pt) => pt.tag.name).join(", "),
          status: post.status,
          featured: post.featured,
          pinned: post.pinned,
          allowComments: post.allowComments,
          metaTitle: post.metaTitle ?? "",
          metaDescription: post.metaDescription ?? "",
          ogImage: post.ogImage ?? "",
          canonicalUrl: post.canonicalUrl ?? "",
          noindex: post.noindex,
          publishedAt: toLocalDateTime(post.publishedAt),
        }}
      />
    </>
  );
}
