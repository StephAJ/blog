import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/ad-slot";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { AuthorCard } from "@/components/post/author-card";
import { CategoryBadge } from "@/components/post/category-badge";
import { Comments } from "@/components/post/comments";
import { PostCard } from "@/components/post/post-card";
import { PostMeta } from "@/components/post/post-meta";
import { PostNavigation } from "@/components/post/post-navigation";
import { ReadingProgress } from "@/components/post/reading-progress";
import { ShareButtons } from "@/components/post/share-buttons";
import { TableOfContents } from "@/components/post/table-of-contents";
import type { CardPost } from "@/components/post/types";
import { ViewCounter } from "@/components/post/view-counter";
import { SectionHeading } from "@/components/section-heading";
import { Sidebar } from "@/components/sidebar/sidebar";
import {
  getAdjacentPosts,
  getAllPublishedSlugs,
  getPageBySlug,
  getPostBySlug,
  getRelatedPosts,
} from "@/db/queries";
import { splitForMidRoll } from "@/lib/article-html";
import { ogImageUrl } from "@/lib/og";
import { sanitizeHtml } from "@/lib/sanitize";
import { getSettings, siteUrl } from "@/lib/settings";
import { extractHeadings, formatDate, isoDate } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.slice(0, 100).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const settings = await getSettings();
  const base = siteUrl(settings.siteUrl);

  const post = await getPostBySlug(slug);
  if (post) {
    const image =
      post.ogImage ??
      post.coverImage ??
      settings.defaultOgImage ??
      ogImageUrl(base, {
        title: post.title,
        label: post.category?.name,
        color: post.category?.color,
        meta: `${post.readingMinutes} min read`,
      });
    return {
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt ?? settings.description,
      alternates: { canonical: post.canonicalUrl ?? `/${post.slug}` },
      robots: post.noindex ? { index: false, follow: true } : undefined,
      openGraph: {
        type: "article",
        title: post.metaTitle ?? post.title,
        description: post.metaDescription ?? post.excerpt ?? undefined,
        url: `${base}/${post.slug}`,
        publishedTime: isoDate(post.publishedAt),
        modifiedTime: isoDate(post.updatedAt),
        authors: [post.author.name],
        section: post.category?.name,
        tags: post.postTags.map((pt) => pt.tag.name),
        images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: post.metaTitle ?? post.title,
        description: post.metaDescription ?? post.excerpt ?? undefined,
        images: [image],
      },
    };
  }

  const page = await getPageBySlug(slug);
  if (page) {
    return {
      title: page.title,
      description: page.metaDescription ?? settings.description,
      alternates: { canonical: `/${page.slug}` },
      openGraph: {
        type: "website",
        title: page.title,
        description: page.metaDescription ?? undefined,
        url: `${base}/${page.slug}`,
        images: [
          {
            url:
              settings.defaultOgImage ??
              ogImageUrl(base, { title: page.title, label: "Page" }),
            width: 1200,
            height: 630,
          },
        ],
      },
    };
  }

  return { title: "Not found" };
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (post) return <ArticleView post={post} />;

  const page = await getPageBySlug(slug);
  if (page) return <StaticPageView page={page} />;

  notFound();
}

async function ArticleView({
  post,
}: {
  post: NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>;
}) {
  const settings = await getSettings();
  const base = siteUrl(settings.siteUrl);
  const url = `${base}/${post.slug}`;

  const [related, neighbours] = await Promise.all([
    getRelatedPosts(
      { id: post.id, categoryId: post.categoryId, postTags: post.postTags },
      3,
    ),
    getAdjacentPosts({ id: post.id, publishedAt: post.publishedAt }),
  ]);

  const { html, headings } = extractHeadings(sanitizeHtml(post.content));
  const chunks = splitForMidRoll(html);
  const image = post.ogImage ?? post.coverImage ?? settings.defaultOgImage;

  return (
    <>
      <ReadingProgress />
      <ViewCounter postId={post.id} />

      <div className="container-page py-8 lg:py-12">
        <Breadcrumbs
          items={[
            ...(post.category
              ? [{ label: post.category.name, href: `/category/${post.category.slug}` }]
              : []),
            { label: post.title },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <article>
              <header>
                {post.category && (
                  <CategoryBadge category={post.category} variant="solid" />
                )}
                <h1 className="mt-4 text-3xl leading-[1.12] font-extrabold sm:text-4xl lg:text-[2.75rem]">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="mt-4 font-serif text-lg leading-relaxed text-body">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y hairline py-4">
                  <PostMeta
                    author={post.author}
                    publishedAt={post.publishedAt}
                    readingMinutes={post.readingMinutes}
                    views={post.views}
                  />
                  <ShareButtons url={url} title={post.title} />
                </div>
              </header>

              {post.coverImage && (
                <figure className="mt-8">
                  <div className="relative aspect-16/9 overflow-hidden rounded-xl surface-subtle">
                    <Image
                      src={post.coverImage}
                      alt={post.coverAlt ?? post.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                    />
                  </div>
                  {post.coverAlt && (
                    <figcaption className="mt-2.5 text-center text-xs text-faint">
                      {post.coverAlt}
                    </figcaption>
                  )}
                </figure>
              )}

              <div className="prose-article prose mt-10 max-w-[70ch] dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: chunks[0] }} />
                {chunks[1] !== undefined && (
                  <>
                    <AdSlot placement="inArticle" className="not-prose my-10" />
                    <div dangerouslySetInnerHTML={{ __html: chunks[1] }} />
                  </>
                )}
              </div>

              {post.postTags.length > 0 && (
                <ul className="mt-10 flex flex-wrap gap-2">
                  {post.postTags.map(({ tag }) => (
                    <li key={tag.id}>
                      <Link
                        href={`/tag/${tag.slug}`}
                        className="inline-block rounded-full border hairline px-3 py-1.5 text-xs font-medium text-body transition hover:border-brand-500 hover:text-accent"
                      >
                        #{tag.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y hairline py-5">
                <p className="text-sm text-faint">
                  Last updated {formatDate(post.updatedAt, "long")}
                </p>
                <ShareButtons url={url} title={post.title} />
              </div>
            </article>

            <div className="mt-10 space-y-12">
              <AuthorCard author={post.author} />
              <PostNavigation
                previous={neighbours.previous}
                next={neighbours.next}
              />

              {related.length > 0 && (
                <section>
                  <SectionHeading title="Related reading" />
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {related.map((item) => (
                      <PostCard key={item.id} post={item as CardPost} />
                    ))}
                  </div>
                </section>
              )}

              {settings.commentsEnabled && (
                <Comments postId={post.id} enabled={post.allowComments} />
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            {/* Only the table of contents is sticky — it is short enough to
                fit. Sticking the whole column would put the bottom of the
                sidebar permanently out of scroll reach. */}
            <div className="lg:sticky lg:top-28">
              <TableOfContents headings={headings} />
            </div>
            <Sidebar />
          </div>
        </div>
      </div>

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": `${url}#article`,
            headline: post.title,
            description: post.metaDescription ?? post.excerpt ?? undefined,
            image: image ? [image] : undefined,
            datePublished: isoDate(post.publishedAt),
            dateModified: isoDate(post.updatedAt),
            wordCount: post.contentText.split(/\s+/).filter(Boolean).length,
            timeRequired: `PT${post.readingMinutes}M`,
            articleSection: post.category?.name,
            keywords: post.postTags.map((pt) => pt.tag.name).join(", "),
            inLanguage: "en",
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            author: {
              "@type": "Person",
              name: post.author.name,
              url: `${base}/author/${post.author.slug}`,
            },
            publisher: {
              "@type": "Organization",
              name: settings.siteName,
              "@id": `${base}/#organization`,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: base },
              ...(post.category
                ? [
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: post.category.name,
                      item: `${base}/category/${post.category.slug}`,
                    },
                  ]
                : []),
              {
                "@type": "ListItem",
                position: post.category ? 3 : 2,
                name: post.title,
                item: url,
              },
            ],
          },
        ]}
      />
    </>
  );
}

async function StaticPageView({
  page,
}: {
  page: NonNullable<Awaited<ReturnType<typeof getPageBySlug>>>;
}) {
  const settings = await getSettings();
  const base = siteUrl(settings.siteUrl);

  return (
    <div className="container-page py-10 lg:py-16">
      <Breadcrumbs items={[{ label: page.title }]} />

      <article className="mx-auto mt-8 max-w-[70ch]">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{page.title}</h1>
        <p className="mt-3 text-sm text-faint">
          Updated {formatDate(page.updatedAt, "long")}
        </p>
        <div
          className="prose-article prose mt-9 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
        />
      </article>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          description: page.metaDescription ?? undefined,
          url: `${base}/${page.slug}`,
          dateModified: isoDate(page.updatedAt),
        }}
      />
    </div>
  );
}
