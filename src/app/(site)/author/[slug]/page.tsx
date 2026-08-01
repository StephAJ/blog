import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { PostListing } from "@/components/post-listing";
import { AuthorAvatar } from "@/components/post/post-meta";
import type { CardPost } from "@/components/post/types";
import { getAuthorBySlug, getAuthors, getPosts } from "@/db/queries";
import { ogImageUrl } from "@/lib/og";
import { getSettings, siteUrl } from "@/lib/settings";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateStaticParams() {
  const authors = await getAuthors();
  return authors.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "Author not found" };

  const settings = await getSettings();
  const base = siteUrl(settings.siteUrl);
  const description = author.bio ?? `Posts written by ${author.name}.`;

  return {
    title: author.name,
    description,
    alternates: { canonical: `/author/${author.slug}` },
    openGraph: {
      type: "profile",
      title: author.name,
      description,
      url: `${base}/author/${author.slug}`,
      images: [
        {
          url:
            author.avatarUrl ??
            ogImageUrl(base, { title: author.name, label: "Author" }),
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const settings = await getSettings();
  const base = siteUrl(settings.siteUrl);
  const page = Math.max(1, Number(pageParam) || 1);
  const feed = await getPosts({
    page,
    perPage: settings.postsPerPage,
    authorSlug: slug,
  });

  return (
    <>
      <PostListing
        title={author.name}
        description={author.bio}
        crumbs={[{ label: "Authors" }, { label: author.name }]}
        posts={feed.items as CardPost[]}
        page={feed.page}
        totalPages={feed.totalPages}
        total={feed.total}
        hrefFor={(target) =>
          target === 1 ? `/author/${slug}` : `/author/${slug}?page=${target}`
        }
        emptyMessage={`${author.name} hasn't published anything yet.`}
      >
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <AuthorAvatar author={author} size={56} className="size-14" />
          {author.website && (
            <a
              href={author.website}
              target="_blank"
              rel="noopener noreferrer me"
              className="text-sm font-semibold text-accent transition hover:underline"
            >
              {author.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {author.twitter && (
            <a
              href={`https://twitter.com/${author.twitter}`}
              target="_blank"
              rel="noopener noreferrer me"
              className="text-sm font-semibold text-accent transition hover:underline"
            >
              @{author.twitter}
            </a>
          )}
        </div>
      </PostListing>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: author.name,
            description: author.bio ?? undefined,
            url: `${base}/author/${author.slug}`,
            sameAs: [
              author.website,
              author.twitter ? `https://twitter.com/${author.twitter}` : null,
            ].filter(Boolean),
          },
        }}
      />
    </>
  );
}
