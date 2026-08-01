import type { Metadata } from "next";

import { HomeFeed } from "@/components/home/home-feed";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: { absolute: `${settings.siteName} — ${settings.tagline}` },
    description: settings.description,
    alternates: { canonical: "/" },
  };
}

export default function HomePage() {
  return <HomeFeed page={1} />;
}
