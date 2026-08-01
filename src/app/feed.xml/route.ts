import { getFeedPosts } from "@/db/queries";
import { getSettings, siteUrl } from "@/lib/settings";

export const revalidate = 900;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const settings = await getSettings();
  const base = siteUrl(settings.siteUrl);
  const posts = await getFeedPosts(25);

  const items = posts
    .map((post) => {
      const url = `${base}/${post.slug}`;
      const image = post.ogImage ?? post.coverImage;

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${(post.publishedAt ?? post.createdAt).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(post.author.name)}</dc:creator>
      ${post.category ? `<category>${escapeXml(post.category.name)}</category>` : ""}
      <description>${escapeXml(post.excerpt ?? "")}</description>
      ${image ? `<enclosure url="${escapeXml(image)}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(settings.siteName)}</title>
    <link>${base}</link>
    <description>${escapeXml(settings.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
