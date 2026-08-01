"use server";

import bcrypt from "bcryptjs";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

import type { ActionState } from "./posts";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(600).optional(),
  avatarUrl: z.string().trim().max(500).optional(),
  twitter: z.string().trim().max(60).optional(),
  website: z.string().trim().max(200).optional(),
  newPassword: z.string().max(200).optional(),
});

export async function saveProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireUser();

  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
    twitter: formData.get("twitter") || undefined,
    website: formData.get("website") || undefined,
    newPassword: formData.get("newPassword") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.name);
  if (!slug) return { error: "That name cannot be turned into a URL." };

  const clash = await db.query.users.findFirst({
    where: and(eq(users.slug, slug), ne(users.id, session.id)),
    columns: { id: true },
  });
  if (clash) return { error: "Another author already uses that URL." };

  if (data.newPassword && data.newPassword.length < 10) {
    return { error: "Use at least 10 characters for a new password." };
  }

  await db
    .update(users)
    .set({
      name: data.name,
      slug,
      bio: data.bio || null,
      avatarUrl: data.avatarUrl || null,
      twitter: data.twitter?.replace(/^@/, "") || null,
      website: data.website || null,
      ...(data.newPassword
        ? { passwordHash: await bcrypt.hash(data.newPassword, 12) }
        : {}),
    })
    .where(eq(users.id, session.id));

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return {
    message: data.newPassword ? "Profile and password updated." : "Profile updated.",
  };
}
