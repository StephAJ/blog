"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { media, settings, subscribers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { DEFAULT_SETTINGS_ID } from "@/lib/settings";

import type { ActionState } from "./posts";

const text = (max: number) => z.string().trim().max(max).optional();

const schema = z.object({
  siteName: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(150),
  description: z.string().trim().max(320),
  siteUrl: z.string().trim().max(200),
  logoUrl: text(500),
  faviconUrl: text(500),
  defaultOgImage: text(500),
  postsPerPage: z.coerce.number().int().min(3).max(48),
  copyright: text(200),
  footerNote: text(300),

  aboutHeading: z.string().trim().max(80),
  aboutText: text(600),
  aboutImage: text(500),

  twitterUrl: text(200),
  twitterHandle: text(60),
  facebookUrl: text(200),
  instagramUrl: text(200),
  linkedinUrl: text(200),
  youtubeUrl: text(200),
  githubUrl: text(200),
  contactEmail: text(200),

  brandColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Theme colour must look like #cf4227"),
  fontHeading: z.string().trim().max(60),
  fontBody: z.string().trim().max(60),
  headingWeight: z.coerce.number().int().min(400).max(900),
  headingTracking: z.string().trim().max(20),
  bodyFontSize: z.coerce.number().min(0.9).max(1.6),
  bodyLineHeight: z.coerce.number().min(1.3).max(2.2),
  h1Size: z.coerce.number().min(1.5).max(5),
  h2Size: z.coerce.number().min(1.1).max(3.5),
  h3Size: z.coerce.number().min(1).max(3),
  h4Size: z.coerce.number().min(0.9).max(2.5),

  smtpHost: text(200),
  smtpPort: z.coerce.number().int().min(1).max(65535),
  smtpUser: text(200),
  smtpPassword: text(400),
  smtpFromName: text(120),
  smtpFromEmail: text(200),

  metaTitleTemplate: z.string().trim().max(120),
  googleSiteVerification: text(200),
  bingSiteVerification: text(200),
  robotsExtra: text(1000),

  gaMeasurementId: text(40),
  gtmContainerId: text(40),
  plausibleDomain: text(120),
  umamiWebsiteId: text(80),
  umamiScriptUrl: text(300),

  adsenseClientId: text(60),
  adSlotHeader: text(40),
  adSlotInArticle: text(40),
  adSlotSidebar: text(40),
  adSlotFooter: text(40),
  adsTxt: text(4000),
});

const FIELDS = Object.keys(schema.shape) as (keyof typeof schema.shape)[];

const CHECKBOXES = [
  "adsenseEnabled",
  "adsenseAutoAds",
  "trendingEnabled",
  "commentsEnabled",
  "commentsAutoApprove",
  "newsletterEnabled",
  "smtpSecure",
  "notifyOnPublish",
] as const;

/** Fields that must never be blanked out by an empty form value. */
const REQUIRED_FIELDS = new Set<string>([
  "siteName",
  "siteUrl",
  "brandColor",
  "fontHeading",
  "fontBody",
  "headingWeight",
  "headingTracking",
  "bodyFontSize",
  "bodyLineHeight",
  "h1Size",
  "h2Size",
  "h3Size",
  "h4Size",
  "smtpPort",
  "postsPerPage",
  "metaTitleTemplate",
  "tagline",
  "description",
  "aboutHeading",
]);

export async function saveSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const raw = Object.fromEntries(
    FIELDS.map((field) => [field, formData.get(field) || undefined]),
  );
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue?.path.join(".")}: ${issue?.message}` };
  }

  const values: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  for (const key of FIELDS) {
    // Optional fields clear to NULL when emptied; required ones keep whatever
    // the schema validated, so a blank input can never null a NOT NULL column.
    if (values[key] === undefined && !REQUIRED_FIELDS.has(key)) values[key] = null;
  }
  values.siteUrl = parsed.data.siteUrl.replace(/\/$/, "");

  // An empty SMTP password means "leave the stored one alone", so the admin
  // can edit other settings without retyping the secret every time.
  if (!formData.get("smtpPassword")) delete values.smtpPassword;

  for (const key of CHECKBOXES) {
    values[key] = formData.get(key) === "on";
  }

  await db
    .insert(settings)
    .values({ id: DEFAULT_SETTINGS_ID, ...values })
    .onConflictDoUpdate({ target: settings.id, set: values });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { message: "Settings saved." };
}

export async function deleteSubscriber(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  await db.delete(subscribers).where(eq(subscribers.id, id));
  revalidatePath("/admin/subscribers");
}

export async function deleteMedia(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  await db.delete(media).where(eq(media.id, id));
  revalidatePath("/admin/media");
}
