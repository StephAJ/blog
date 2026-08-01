import { NextResponse } from "next/server";

import { getMediaLibrary } from "@/db/queries";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getMediaLibrary(200);

  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      url: item.url,
      filename: item.filename,
      width: item.width,
      height: item.height,
      alt: item.alt,
    })),
  });
}
