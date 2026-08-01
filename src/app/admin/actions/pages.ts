"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { pages } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/utils";

import type { ActionState } from "./posts";

const schema = z.object({
  id: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(2).max(150),
  slug: z.string().trim().max(150).optional(),
  content: z.string().default(""),
  metaDescription: z.string().trim().max(320).optional(),
  status: z.enum(["draft", "published"]),
});

export async function savePage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    content: formData.get("content") ?? "",
    metaDescription: formData.get("metaDescription") || undefined,
    status: formData.get("status") ?? "published",
  });

  if (!parsed.success) return { error: "Give the page a title." };

  const data = parsed.data;
  const slug = slugify(data.slug || data.title);
  if (!slug) return { error: "That title cannot be turned into a URL." };

  const clash = await db.query.pages.findFirst({
    where: data.id ? and(eq(pages.slug, slug), ne(pages.id, data.id)) : eq(pages.slug, slug),
    columns: { id: true },
  });
  if (clash) return { error: "A page with that URL already exists." };

  const values = {
    title: data.title,
    slug,
    content: sanitizeHtml(data.content),
    metaDescription: data.metaDescription || null,
    status: data.status,
    showInFooter: formData.get("showInFooter") === "on",
    updatedAt: new Date(),
  };

  let pageId = data.id;

  if (pageId) {
    await db.update(pages).set(values).where(eq(pages.id, pageId));
  } else {
    const [created] = await db.insert(pages).values(values).returning({ id: pages.id });
    pageId = created.id;
  }

  revalidatePath("/", "layout");
  revalidatePath(`/${slug}`);

  if (!data.id) redirect(`/admin/pages/${pageId}?saved=1`);
  return { message: "Saved." };
}

export async function deletePage(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const page = await db.query.pages.findFirst({
    where: eq(pages.id, id),
    columns: { slug: true },
  });

  await db.delete(pages).where(eq(pages.id, id));

  if (page) revalidatePath(`/${page.slug}`);
  revalidatePath("/", "layout");
  redirect("/admin/pages");
}
