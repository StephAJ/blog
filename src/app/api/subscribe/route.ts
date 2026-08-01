import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";

const schema = z.object({
  email: z.email().max(200),
  source: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  const settings = await getSettings();
  if (!settings.newsletterEnabled) {
    return NextResponse.json(
      { error: "The newsletter is currently closed." },
      { status: 403 },
    );
  }

  const limit = rateLimit(`subscribe:${clientIp(request.headers)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  await db
    .insert(subscribers)
    .values({
      email: parsed.data.email.toLowerCase(),
      source: parsed.data.source ?? "sidebar",
    })
    .onConflictDoNothing();

  return NextResponse.json({ message: "You're on the list. Thanks for subscribing." });
}
