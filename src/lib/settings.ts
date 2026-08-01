import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { settings, type Settings } from "@/db/schema";

export const DEFAULT_SETTINGS_ID = 1;

/** Reads (and lazily creates) the single settings row. Deduped per request. */
export const getSettings = cache(async (): Promise<Settings> => {
  const existing = await db.query.settings.findFirst({
    where: eq(settings.id, DEFAULT_SETTINGS_ID),
  });
  if (existing) return existing;

  const [created] = await db
    .insert(settings)
    .values({ id: DEFAULT_SETTINGS_ID })
    .returning();
  return created;
});

/** Canonical origin, env var wins so staging never leaks production URLs. */
export function siteUrl(fromSettings?: string | null) {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    fromSettings ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}
