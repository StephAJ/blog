import { getSettings, siteUrl } from "@/lib/settings";

export const revalidate = 3600;

export async function GET() {
  const settings = await getSettings();
  const base = siteUrl(settings.siteUrl);

  const lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api/",
    "Disallow: /search",
    "",
    `Sitemap: ${base}/sitemap.xml`,
    `Host: ${base}`,
  ];

  if (settings.robotsExtra?.trim()) {
    lines.push("", settings.robotsExtra.trim());
  }

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
