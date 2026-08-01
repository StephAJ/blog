"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { postTags, posts, tags } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";
import { makeExcerpt, readingMinutes, slugify, stripHtml } from "@/lib/utils";

export type ActionState = { error?: string; message?: string };

/** Paths that belong to the app, so a post can never shadow them. */
const RESERVED_SLUGS = new Set([
  "admin", "api", "archive", "search", "category", "tag", "author", "page",
  "feed.xml", "atom.xml", "sitemap.xml", "robots.txt", "ads.txt", "icon.svg",
  "opengraph-image", "_next", "uploads",
]);

const schema = z.object({
  id: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(2, "Give the post a title.").max(200),
  slug: z.string().trim().max(200).optional(),
  excerpt: z.string().trim().max(500).optional(),
  content: z.string().default(""),
  coverImage: z.string().trim().max(500).optional(),
  coverAlt: z.string().trim().max(300).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  tagList: z.string().max(500).optional(),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string().optional(),
  metaTitle: z.string().trim().max(200).optional(),
  metaDescription: z.string().trim().max(320).optional(),
  ogImage: z.string().trim().max(500).optional(),
  canonicalUrl: z.string().trim().max(500).optional(),
});

function readForm(formData: FormData) {
  return schema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content") ?? "",
    coverImage: formData.get("coverImage") || undefined,
    coverAlt: formData.get("coverAlt") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    tagList: formData.get("tagList") || undefined,
    status: formData.get("status") ?? "draft",
    publishedAt: formData.get("publishedAt") || undefined,
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
    ogImage: formData.get("ogImage") || undefined,
    canonicalUrl: formData.get("canonicalUrl") || undefined,
  });
}

async function uniqueSlug(base: string, excludeId?: number) {
  let candidate = base;
  let suffix = 2;

  while (true) {
    const clash = await db.query.posts.findFirst({
      where: excludeId
        ? and(eq(posts.slug, candidate), ne(posts.id, excludeId))
        : eq(posts.slug, candidate),
      columns: { id: true },
    });
    if (!clash && !RESERVED_SLUGS.has(candidate)) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

async function syncTags(postId: number, list: string | undefined) {
  await db.delete(postTags).where(eq(postTags.postId, postId));
  if (!list?.trim()) return;

  const names = [
    ...new Set(
      list
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .slice(0, 20),
    ),
  ];

  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;

    const [tag] = await db
      .insert(tags)
      .values({ name, slug })
      .onConflictDoUpdate({ target: tags.slug, set: { name } })
      .returning();

    await db.insert(postTags).values({ postId, tagId: tag.id }).onConflictDoNothing();
  }
}

export async function savePost(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = readForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const data = parsed.data;
  const content = sanitizeHtml(data.content);
  const contentText = stripHtml(content);
  const slug = await uniqueSlug(
    slugify(data.slug || data.title) || `post-${Date.now()}`,
    data.id,
  );

  const publishedAt =
    data.status === "published"
      ? data.publishedAt
        ? new Date(data.publishedAt)
        : new Date()
      : data.publishedAt
        ? new Date(data.publishedAt)
        : null;

  const values = {
    title: data.title,
    slug,
    excerpt: data.excerpt || makeExcerpt(contentText),
    content,
    contentText,
    coverImage: data.coverImage || null,
    coverAlt: data.coverAlt || null,
    categoryId: data.categoryId ?? null,
    status: data.status,
    featured: formData.get("featured") === "on",
    pinned: formData.get("pinned") === "on",
    allowComments: formData.get("allowComments") === "on",
    noindex: formData.get("noindex") === "on",
    metaTitle: data.metaTitle || null,
    metaDescription: data.metaDescription || null,
    ogImage: data.ogImage || null,
    canonicalUrl: data.canonicalUrl || null,
    readingMinutes: readingMinutes(contentText),
    publishedAt,
    updatedAt: new Date(),
  };

  let postId = data.id;

  if (postId) {
    const previous = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      columns: { slug: true },
    });
    await db.update(posts).set(values).where(eq(posts.id, postId));
    if (previous && previous.slug !== slug) revalidatePath(`/${previous.slug}`);
  } else {
    const [created] = await db
      .insert(posts)
      .values({ ...values, authorId: user.id })
      .returning({ id: posts.id });
    postId = created.id;
  }

  await syncTags(postId, data.tagList);

  revalidatePath("/", "layout");
  revalidatePath(`/${slug}`);

  if (!data.id) redirect(`/admin/posts/${postId}?saved=1`);
  return { message: "Saved." };
}

export async function deletePost(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    columns: { slug: true },
  });

  await db.delete(posts).where(eq(posts.id, id));

  if (post) revalidatePath(`/${post.slug}`);
  revalidatePath("/", "layout");
  redirect("/admin/posts");
}

export async function togglePostStatus(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    columns: { status: true, slug: true, publishedAt: true },
  });
  if (!post) return;

  const status = post.status === "published" ? "draft" : "published";

  await db
    .update(posts)
    .set({
      status,
      publishedAt:
        status === "published" ? (post.publishedAt ?? new Date()) : post.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));

  revalidatePath("/", "layout");
  revalidatePath(`/${post.slug}`);
  revalidatePath("/admin/posts");
}
