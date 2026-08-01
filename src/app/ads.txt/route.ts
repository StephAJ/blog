import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

/**
 * AdSense requires an ads.txt at the domain root before it will serve ads.
 * The contents live in Admin → Settings so they can change without a deploy.
 */
export async function GET() {
  const settings = await getSettings();
  const body = settings.adsTxt?.trim();

  if (!body) return new Response("", { status: 404 });

  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
