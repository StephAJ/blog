import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import sharp from "sharp";

import { db } from "@/db";
import { media } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Images must be under 10 MB." }, { status: 413 });
  }
  if (!ACCEPTED.has(file.type)) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, WebP, AVIF or GIF image." },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const now = new Date();
  const dir = path.join(
    process.cwd(),
    "public",
    "uploads",
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  await fs.mkdir(dir, { recursive: true });

  const base =
    slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 60) || "image";
  const unique = randomBytes(4).toString("hex");

  // Animated GIFs lose their frames through the resize pipeline, so pass them
  // through untouched; everything else is re-encoded to WebP.
  const isGif = file.type === "image/gif";
  const filename = `${base}-${unique}.${isGif ? "gif" : "webp"}`;

  let width: number | null = null;
  let height: number | null = null;
  let output = buffer;

  if (isGif) {
    const meta = await sharp(buffer, { animated: true }).metadata();
    width = meta.width ?? null;
    height = meta.pageHeight ?? meta.height ?? null;
  } else {
    const pipeline = sharp(buffer).rotate().resize({
      width: 1920,
      withoutEnlargement: true,
    });
    output = await pipeline.webp({ quality: 82 }).toBuffer();
    const meta = await sharp(output).metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;
  }

  await fs.writeFile(path.join(dir, filename), output);

  const url = `/uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${filename}`;

  const [row] = await db
    .insert(media)
    .values({
      url,
      filename,
      mimeType: isGif ? "image/gif" : "image/webp",
      width,
      height,
      size: output.byteLength,
      alt: null,
    })
    .returning();

  return NextResponse.json({ url, id: row.id, width, height });
}
