import type { MetadataRoute } from "next";

import {
  getAllPublishedSlugs,
  getAuthors,
  getCategoriesWithCounts,
  getFooterPages,
  getTagsWithCounts,
} from "@/db/queries";
import { getSettings, siteUrl } from "@/lib/settings";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings();
  const base = siteUrl(settings.siteUrl);

  const [posts, categories, tags, authors, pages] = await Promise.all([
    getAllPublishedSlugs(),
    getCategoriesWithCounts(),
    getTagsWithCounts(),
    getAuthors(),
    getFooterPages(),
  ]);

  const newest = posts[0]?.publishedAt ?? new Date();

  return [
    {
      url: base,
      lastModified: newest,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/archive`,
      lastModified: newest,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...posts.map((post) => ({
      url: `${base}/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...pages.map((page) => ({
      url: `${base}/${page.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...categories
      .filter((category) => category.count > 0)
      .map((category) => ({
        url: `${base}/category/${category.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ...tags
      .filter((tag) => tag.count > 0)
      .map((tag) => ({
        url: `${base}/tag/${tag.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.4,
      })),
    ...authors.map((author) => ({
      url: `${base}/author/${author.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
