"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { comments } from "@/db/schema";
import { requireUser } from "@/lib/auth";

async function commentPostSlug(id: number) {
  const row = await db.query.comments.findFirst({
    where: eq(comments.id, id),
    with: { post: { columns: { slug: true } } },
  });
  return row?.post.slug ?? null;
}

export async function setCommentStatus(formData: FormData) {
  await requireUser();

  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(id)) return;
  if (!["pending", "approved", "spam"].includes(status)) return;

  const slug = await commentPostSlug(id);

  await db
    .update(comments)
    .set({ status: status as "pending" | "approved" | "spam" })
    .where(eq(comments.id, id));

  if (slug) revalidatePath(`/${slug}`);
  revalidatePath("/admin/comments");
  revalidatePath("/admin", "layout");
}

export async function deleteComment(formData: FormData) {
  await requireUser();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const slug = await commentPostSlug(id);
  await db.delete(comments).where(eq(comments.id, id));

  if (slug) revalidatePath(`/${slug}`);
  revalidatePath("/admin/comments");
  revalidatePath("/admin", "layout");
}
