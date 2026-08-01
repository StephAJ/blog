import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomeFeed } from "@/components/home/home-feed";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

type Props = { params: Promise<{ page: string }> };

function parsePage(value: string) {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 2) notFound();
  return page;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const settings = await getSettings();

  return {
    title: `Page ${page}`,
    description: settings.description,
    alternates: { canonical: `/page/${page}` },
  };
}

export default async function PaginatedHomePage({ params }: Props) {
  const { page } = await params;
  return <HomeFeed page={parsePage(page)} />;
}
