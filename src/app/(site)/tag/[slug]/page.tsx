import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostListing } from "@/components/post-listing";
import type { CardPost } from "@/components/post/types";
import { getPosts, getTagBySlug, getTagsWithCounts } from "@/db/queries";
import { ogImageUrl } from "@/lib/og";
import { getSettings, siteUrl } from "@/lib/settings";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateStaticParams() {
  const tags = await getTagsWithCounts();
  return tags.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Tag not found" };

  const settings = await getSettings();
  const base = siteUrl(settings.siteUrl);
  const description = `Posts tagged ${tag.name} on ${settings.siteName}.`;

  return {
    title: `#${tag.name}`,
    description,
    alternates: { canonical: `/tag/${tag.slug}` },
    openGraph: {
      type: "website",
      title: `#${tag.name}`,
      description,
      url: `${base}/tag/${tag.slug}`,
      images: [
        {
          url: ogImageUrl(base, { title: `#${tag.name}`, label: "Tag" }),
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const settings = await getSettings();
  const page = Math.max(1, Number(pageParam) || 1);
  const feed = await getPosts({ page, perPage: settings.postsPerPage, tagSlug: slug });

  return (
    <PostListing
      title={`#${tag.name}`}
      description={`Everything tagged ${tag.name}.`}
      crumbs={[{ label: "Tags", href: "/archive" }, { label: tag.name }]}
      posts={feed.items as CardPost[]}
      page={feed.page}
      totalPages={feed.totalPages}
      total={feed.total}
      hrefFor={(target) => (target === 1 ? `/tag/${slug}` : `/tag/${slug}?page=${target}`)}
      emptyMessage={`Nothing tagged ${tag.name} yet.`}
    />
  );
}
