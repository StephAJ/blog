import type { Metadata } from "next";

import { PostForm } from "@/components/admin/post-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getSettings, siteUrl } from "@/lib/settings";

export const metadata: Metadata = { title: "New post" };
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const settings = await getSettings();
  const categoryList = await db.select().from(categories).orderBy(categories.position);

  return (
    <>
      <AdminPageHeader title="New post" description="Write it, then publish when ready." />

      <PostForm
        siteUrl={siteUrl(settings.siteUrl)}
        categories={categoryList}
        values={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          coverImage: "",
          coverAlt: "",
          categoryId: null,
          tagList: "",
          status: "draft",
          featured: false,
          pinned: false,
          allowComments: true,
          metaTitle: "",
          metaDescription: "",
          ogImage: "",
          canonicalUrl: "",
          noindex: false,
          publishedAt: "",
        }}
      />
    </>
  );
}
