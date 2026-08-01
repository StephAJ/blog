import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { comments, posts } from "@/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";

const schema = z.object({
  postId: z.number().int().positive(),
  authorName: z.string().trim().min(2).max(80),
  authorEmail: z.email().max(200),
  website: z.union([z.url().max(200), z.literal("")]).optional(),
  content: z.string().trim().min(4).max(3000),
  /** Honeypot — bots fill it, humans never see it. */
  url: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const settings = await getSettings();
  if (!settings.commentsEnabled) {
    return NextResponse.json({ error: "Comments are disabled." }, { status: 403 });
  }

  const limit = rateLimit(`comment:${clientIp(request.headers)}`, 4, 300_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You're commenting a little fast. Try again shortly." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, parsed.data.postId),
    columns: { id: true, slug: true, allowComments: true, status: true },
  });

  if (!post || post.status !== "published" || !post.allowComments) {
    return NextResponse.json(
      { error: "Comments are closed on this post." },
      { status: 403 },
    );
  }

  const status = settings.commentsAutoApprove ? "approved" : "pending";

  await db.insert(comments).values({
    postId: post.id,
    authorName: parsed.data.authorName,
    authorEmail: parsed.data.authorEmail.toLowerCase(),
    website: parsed.data.website || null,
    content: parsed.data.content,
    status,
  });

  if (status === "approved") revalidatePath(`/${post.slug}`);

  return NextResponse.json({
    message:
      status === "approved"
        ? "Comment posted — thanks for reading."
        : "Thanks. Your comment is awaiting moderation.",
  });
}
