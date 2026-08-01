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
  const updated = (posts[0]?.updatedAt ?? new Date()).toISOString();

  const entries = posts
    .map((post) => {
      const url = `${base}/${post.slug}`;
      return `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${url}" />
    <id>${url}</id>
    <updated>${post.updatedAt.toISOString()}</updated>
    <published>${(post.publishedAt ?? post.createdAt).toISOString()}</published>
    <author><name>${escapeXml(post.author.name)}</name></author>
    <summary>${escapeXml(post.excerpt ?? "")}</summary>
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(settings.siteName)}</title>
  <subtitle>${escapeXml(settings.description)}</subtitle>
  <link href="${base}/atom.xml" rel="self" />
  <link href="${base}" />
  <id>${base}/</id>
  <updated>${updated}</updated>
${entries}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
