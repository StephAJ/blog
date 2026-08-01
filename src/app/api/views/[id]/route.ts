import { NextResponse } from "next/server";

import { incrementViews } from "@/db/queries";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId < 1) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const limit = rateLimit(`view:${clientIp(request.headers)}:${postId}`, 1, 3_600_000);
  if (!limit.ok) return NextResponse.json({ ok: true });

  await incrementViews(postId);
  return NextResponse.json({ ok: true });
}
