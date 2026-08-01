import slugifyLib from "slugify";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return slugifyLib(input, { lower: true, strict: true, trim: true });
}

export function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function makeExcerpt(text: string, length = 175) {
  const clean = stripHtml(text);
  if (clean.length <= length) return clean;
  const cut = clean.slice(0, length);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function formatDate(
  date: Date | number | null | undefined,
  style: "long" | "short" | "numeric" = "long",
) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date * 1000);
  if (Number.isNaN(d.getTime())) return "";

  const options: Intl.DateTimeFormatOptions =
    style === "long"
      ? { year: "numeric", month: "long", day: "numeric" }
      : style === "short"
        ? { year: "numeric", month: "short", day: "numeric" }
        : { year: "numeric", month: "2-digit", day: "2-digit" };

  return new Intl.DateTimeFormat("en-US", options).format(d);
}

export function isoDate(date: Date | null | undefined) {
  if (!date) return undefined;
  return date instanceof Date ? date.toISOString() : undefined;
}

export function relativeTime(date: Date | null | undefined) {
  if (!date) return "";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(-days, "day");
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(-months, "month");
  return rtf.format(-Math.round(months / 12), "year");
}

/** Deterministic pastel-ish colour from any string — used for avatars/tags. */
export function colorFromString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360} 62% 48%)`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Decide readable foreground text for an arbitrary hex background. */
export function contrastText(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#ffffff";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1a1917" : "#ffffff";
}

export function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return `rgba(217, 72, 43, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function absoluteUrl(base: string, path: string) {
  if (!path) return base;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Adds `id` attributes to h2/h3 headings and returns the table of contents.
 * Runs on the server so the rendered HTML is anchor-ready.
 */
export function extractHeadings(html: string) {
  const headings: Array<{ id: string; text: string; level: 2 | 3 }> = [];
  const seen = new Map<string, number>();

  const withIds = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, level: string, attrs: string, inner: string) => {
      const text = stripHtml(inner);
      if (!text) return _match;

      let id = slugify(text) || `section-${headings.length + 1}`;
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count + 1}`;

      headings.push({ id, text, level: Number(level) === 3 ? 3 : 2 });
      const cleanedAttrs = attrs.replace(/\s*id="[^"]*"/i, "");
      return `<h${level}${cleanedAttrs} id="${id}">${inner}</h${level}>`;
    },
  );

  return { html: withIds, headings };
}
