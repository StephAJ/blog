"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { categories, tags } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

import type { ActionState } from "./posts";

const categorySchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().max(300).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour like #d9482b")
    .default("#d9482b"),
  position: z.coerce.number().int().min(0).max(999).default(0),
});

export async function saveCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = categorySchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    color: formData.get("color") || "#d9482b",
    position: formData.get("position") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.name);
  if (!slug) return { error: "That name cannot be turned into a URL." };

  const clash = await db.query.categories.findFirst({
    where: data.id
      ? and(eq(categories.slug, slug), ne(categories.id, data.id))
      : eq(categories.slug, slug),
    columns: { id: true },
  });
  if (clash) return { error: "A category with that URL already exists." };

  const values = {
    name: data.name,
    slug,
    description: data.description || null,
    color: data.color,
    position: data.position,
  };

  if (data.id) {
    await db.update(categories).set(values).where(eq(categories.id, data.id));
  } else {
    await db.insert(categories).values(values);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  return { message: data.id ? "Category updated." : "Category created." };
}

export async function deleteCategory(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
}

const tagSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(1).max(50),
});

export async function saveTag(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = tagSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: "Enter a tag name." };

  const slug = slugify(parsed.data.name);
  if (!slug) return { error: "That name cannot be turned into a URL." };

  const clash = await db.query.tags.findFirst({
    where: parsed.data.id
      ? and(eq(tags.slug, slug), ne(tags.id, parsed.data.id))
      : eq(tags.slug, slug),
    columns: { id: true },
  });
  if (clash) return { error: "That tag already exists." };

  if (parsed.data.id) {
    await db
      .update(tags)
      .set({ name: parsed.data.name, slug })
      .where(eq(tags.id, parsed.data.id));
  } else {
    await db.insert(tags).values({ name: parsed.data.name, slug });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/tags");
  return { message: "Saved." };
}

export async function deleteTag(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  await db.delete(tags).where(eq(tags.id, id));
  revalidatePath("/", "layout");
  revalidatePath("/admin/tags");
}
