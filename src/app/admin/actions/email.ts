"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { broadcasts, posts } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  postAnnouncementHtml,
  sendTestEmail,
  sendToSubscribers,
  smtpConfigured,
} from "@/lib/mail";
import { sanitizeHtml } from "@/lib/sanitize";
import { getSettings, siteUrl } from "@/lib/settings";

import type { ActionState } from "./posts";

export async function sendTest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = z.email().safeParse(formData.get("testEmail"));
  if (!parsed.success) return { error: "Enter a valid email address." };

  const result = await sendTestEmail(parsed.data);
  if (result.error) return { error: result.error };
  return { message: `Test email sent to ${parsed.data}.` };
}

const broadcastSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10),
});

export async function sendBroadcast(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = broadcastSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: "Give the email a subject and some content." };
  }

  const bodyHtml = sanitizeHtml(parsed.data.body);
  const result = await sendToSubscribers({
    subject: parsed.data.subject,
    bodyHtml,
  });

  if (result.error) return { error: result.error };

  await db.insert(broadcasts).values({
    subject: parsed.data.subject,
    body: bodyHtml,
    kind: "manual",
    sentCount: result.sent,
    failedCount: result.failed,
  });

  revalidatePath("/admin/subscribers");

  return {
    message:
      result.failed > 0
        ? `Sent to ${result.sent} subscribers, ${result.failed} failed.`
        : `Sent to ${result.sent} subscriber${result.sent === 1 ? "" : "s"}.`,
  };
}

/**
 * Emails subscribers about a post. Used both by the manual button and by the
 * automatic hook on publish; `notifiedAt` guarantees a post is only ever
 * announced once.
 */
export async function notifySubscribersOfPost(postId: number, force = false) {
  const settings = await getSettings();
  if (!smtpConfigured(settings)) return { skipped: "SMTP not configured" };

  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!post || post.status !== "published") return { skipped: "Post is not published" };
  if (post.notifiedAt && !force) return { skipped: "Already announced" };

  const base = siteUrl(settings.siteUrl);
  const result = await sendToSubscribers({
    subject: post.title,
    bodyHtml: postAnnouncementHtml(post, base),
  });

  if (result.error) return { skipped: result.error };

  await db.update(posts).set({ notifiedAt: new Date() }).where(eq(posts.id, postId));
  await db.insert(broadcasts).values({
    subject: post.title,
    body: `Announcement for /${post.slug}`,
    kind: "new-post",
    postId: post.id,
    sentCount: result.sent,
    failedCount: result.failed,
  });

  return { sent: result.sent, failed: result.failed };
}

export async function announcePost(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const postId = Number(formData.get("postId"));
  if (!Number.isInteger(postId)) return { error: "Pick a post." };

  const result = await notifySubscribersOfPost(postId, formData.get("force") === "on");
  if ("skipped" in result) return { error: result.skipped };

  revalidatePath("/admin/subscribers");
  return {
    message: `Announced to ${result.sent} subscriber${result.sent === 1 ? "" : "s"}${
      result.failed ? `, ${result.failed} failed` : ""
    }.`,
  };
}

export async function getRecentBroadcasts() {
  return db.query.broadcasts.findMany({
    orderBy: [desc(broadcasts.createdAt)],
    limit: 10,
  });
}
