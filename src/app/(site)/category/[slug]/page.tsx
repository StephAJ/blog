import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostListing } from "@/components/post-listing";
import type { CardPost } from "@/components/post/types";
import { getCategoriesWithCounts, getCategoryBySlug, getPosts } from "@/db/queries";
import { ogImageUrl } from "@/lib/og";
import { getSettings, siteUrl } from "@/lib/settings";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateStaticParams() {
  const categories = await getCategoriesWithCounts();
  return categories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };

  const settings = await getSettings();
  const base = siteUrl(settings.siteUrl);
  const description =
    category.description ??
    `Everything filed under ${category.name} on ${settings.siteName}.`;

  return {
    title: `${category.name} articles`,
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      type: "website",
      title: `${category.name} articles`,
      description,
      url: `${base}/category/${category.slug}`,
      images: [
        {
          url: ogImageUrl(base, {
            title: `${category.name} articles`,
            label: "Category",
            color: category.color,
          }),
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const settings = await getSettings();
  const page = Math.max(1, Number(pageParam) || 1);
  const feed = await getPosts({
    page,
    perPage: settings.postsPerPage,
    categorySlug: slug,
  });

  return (
    <PostListing
      title={category.name}
      description={category.description}
      accent={category.color}
      crumbs={[{ label: "Categories", href: "/archive" }, { label: category.name }]}
      posts={feed.items as CardPost[]}
      page={feed.page}
      totalPages={feed.totalPages}
      total={feed.total}
      hrefFor={(target) =>
        target === 1 ? `/category/${slug}` : `/category/${slug}?page=${target}`
      }
      emptyMessage={`No posts in ${category.name} yet.`}
    />
  );
}
