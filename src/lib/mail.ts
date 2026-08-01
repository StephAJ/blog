import "server-only";

import { randomBytes } from "node:crypto";

import { eq, isNull } from "drizzle-orm";
import nodemailer, { type Transporter } from "nodemailer";

import { db } from "@/db";
import { subscribers, type Settings } from "@/db/schema";
import { getSettings, siteUrl } from "@/lib/settings";

export type MailResult = { sent: number; failed: number; error?: string };

export function smtpConfigured(settings: Settings) {
  return Boolean(settings.smtpHost && settings.smtpFromEmail);
}

function buildTransport(settings: Settings): Transporter | null {
  if (!smtpConfigured(settings)) return null;

  return nodemailer.createTransport({
    host: settings.smtpHost!,
    port: settings.smtpPort,
    // Port 465 is implicit TLS; 587 upgrades via STARTTLS.
    secure: settings.smtpSecure || settings.smtpPort === 465,
    auth: settings.smtpUser
      ? { user: settings.smtpUser, pass: settings.smtpPassword ?? "" }
      : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
  });
}

function fromAddress(settings: Settings) {
  const name = settings.smtpFromName || settings.siteName;
  return `"${name.replace(/"/g, "")}" <${settings.smtpFromEmail}>`;
}

/** Gives every subscriber a token so unsubscribe links keep working. */
export async function ensureUnsubscribeToken(id: number, existing: string | null) {
  if (existing) return existing;
  const token = randomBytes(24).toString("hex");
  await db.update(subscribers).set({ unsubscribeToken: token }).where(eq(subscribers.id, id));
  return token;
}

export async function backfillUnsubscribeTokens() {
  const missing = await db.query.subscribers.findMany({
    where: isNull(subscribers.unsubscribeToken),
    columns: { id: true },
  });
  for (const row of missing) {
    await db
      .update(subscribers)
      .set({ unsubscribeToken: randomBytes(24).toString("hex") })
      .where(eq(subscribers.id, row.id));
  }
  return missing.length;
}

export async function sendTestEmail(to: string): Promise<MailResult> {
  const settings = await getSettings();
  const transport = buildTransport(settings);
  if (!transport) {
    return { sent: 0, failed: 0, error: "Add an SMTP host and a from-address first." };
  }

  try {
    await transport.sendMail({
      from: fromAddress(settings),
      to,
      subject: `Test email from ${settings.siteName}`,
      text: `If you are reading this, SMTP is configured correctly.`,
      html: wrapEmail(
        settings,
        `<h1 style="margin:0 0 12px;font-size:22px;">SMTP is working</h1>
         <p style="margin:0;">If you are reading this, ${escapeHtml(settings.siteName)} can send email.</p>`,
      ),
    });
    return { sent: 1, failed: 0 };
  } catch (error) {
    return {
      sent: 0,
      failed: 1,
      error: error instanceof Error ? error.message : "Send failed.",
    };
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Minimal, table-free HTML shell — readable in every client that matters. */
export function wrapEmail(settings: Settings, inner: string, unsubscribeUrl?: string) {
  const base = siteUrl(settings.siteUrl);

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f5f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1917;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;padding:32px;">
    <p style="margin:0 0 24px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#8a857b;font-weight:700;">
      ${escapeHtml(settings.siteName)}
    </p>
    ${inner}
  </div>
  <p style="max-width:560px;margin:18px auto 0;font-size:12px;line-height:1.6;color:#8a857b;text-align:center;">
    <a href="${base}" style="color:#8a857b;">${escapeHtml(base.replace(/^https?:\/\//, ""))}</a>
    ${
      unsubscribeUrl
        ? ` &middot; <a href="${unsubscribeUrl}" style="color:#8a857b;">Unsubscribe</a>`
        : ""
    }
  </p>
</body></html>`;
}

/**
 * Sends one message per subscriber so each gets their own unsubscribe link,
 * and so one bad address cannot take down the whole run.
 */
export async function sendToSubscribers(options: {
  subject: string;
  bodyHtml: string;
}): Promise<MailResult> {
  const settings = await getSettings();
  const transport = buildTransport(settings);
  if (!transport) {
    return { sent: 0, failed: 0, error: "SMTP is not configured." };
  }

  const list = await db.query.subscribers.findMany();
  if (list.length === 0) return { sent: 0, failed: 0, error: "No subscribers yet." };

  const base = siteUrl(settings.siteUrl);
  let sent = 0;
  let failed = 0;

  for (const subscriber of list) {
    const token = await ensureUnsubscribeToken(
      subscriber.id,
      subscriber.unsubscribeToken,
    );
    const unsubscribeUrl = `${base}/unsubscribe?token=${token}`;

    try {
      await transport.sendMail({
        from: fromAddress(settings),
        to: subscriber.email,
        subject: options.subject,
        html: wrapEmail(settings, options.bodyHtml, unsubscribeUrl),
        headers: {
          // Lets Gmail and friends surface a native unsubscribe control.
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return { sent, failed };
}

export function postAnnouncementHtml(post: {
  title: string;
  excerpt: string | null;
  slug: string;
  coverImage: string | null;
  readingMinutes: number;
}, base: string) {
  const url = `${base}/${post.slug}`;
  const cover =
    post.coverImage && post.coverImage.startsWith("http")
      ? post.coverImage
      : post.coverImage
        ? `${base}${post.coverImage}`
        : null;

  return `
    ${
      cover
        ? `<img src="${cover}" alt="" width="496" style="width:100%;border-radius:10px;margin:0 0 20px;display:block;" />`
        : ""
    }
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;">${escapeHtml(post.title)}</h1>
    ${
      post.excerpt
        ? `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#5c584f;">${escapeHtml(post.excerpt)}</p>`
        : ""
    }
    <p style="margin:0 0 24px;font-size:13px;color:#8a857b;">${post.readingMinutes} min read</p>
    <a href="${url}" style="display:inline-block;background:#cf4227;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:9px;font-weight:700;font-size:15px;">Read the post</a>`;
}
