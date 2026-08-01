import Image from "next/image";
import Link from "next/link";

import { AdSlot } from "@/components/ads/ad-slot";
import { PostCardRanked } from "@/components/post/post-card";
import type { CardPost } from "@/components/post/types";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { SocialLinks } from "@/components/site/social-links";
import { getCategoriesWithCounts, getPopularPosts, getTagsWithCounts } from "@/db/queries";
import { getSettings } from "@/lib/settings";
import { cn, hexToRgba } from "@/lib/utils";

function Widget({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border hairline surface p-5", className)}>
      {title && (
        <h2 className="eyebrow mb-4 flex items-center gap-2 text-faint">
          <span className="h-3 w-0.5 rounded-full bg-brand-600" />
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export async function Sidebar({ className }: { className?: string }) {
  const [settings, popular, categories, tags] = await Promise.all([
    getSettings(),
    getPopularPosts(5),
    getCategoriesWithCounts(),
    getTagsWithCounts(14),
  ]);

  const activeCategories = categories.filter((category) => category.count > 0);
  const activeTags = tags.filter((tag) => tag.count > 0);

  return (
    <aside className={cn("space-y-6", className)}>
      {settings.aboutText && (
        <Widget className="text-center">
          {settings.aboutImage && (
            <Image
              src={settings.aboutImage}
              alt={settings.siteName}
              width={200}
              height={200}
              // The portrait is transparent-backed, so give it a tinted disc
              // to sit on rather than letting the page show through.
              className="mx-auto size-24 rounded-full bg-brand-50 object-cover object-top dark:bg-brand-950/40"
            />
          )}
          <h2 className="mt-4 text-base font-bold">{settings.aboutHeading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-body">{settings.aboutText}</p>
          <SocialLinks
            settings={settings}
            className="mt-4 justify-center"
            showRss={false}
            itemClassName="border hairline"
          />
        </Widget>
      )}

      {settings.newsletterEnabled && (
        <Widget className="bg-linear-to-br from-brand-50 to-transparent dark:from-brand-950/40">
          <h2 className="text-base font-bold">Get new posts by email</h2>
          <p className="mt-1.5 mb-4 text-sm leading-relaxed text-body">
            One email when something new goes up. Nothing else.
          </p>
          <NewsletterForm source="sidebar" />
        </Widget>
      )}

      {popular.length > 0 && (
        <Widget title="Most read">
          <div className="space-y-4">
            {popular.map((post, index) => (
              <PostCardRanked key={post.id} post={post as CardPost} rank={index + 1} />
            ))}
          </div>
        </Widget>
      )}

      <AdSlot placement="sidebar" className="rounded-xl border hairline surface p-4" />

      {activeCategories.length > 0 && (
        <Widget title="Categories">
          <ul className="space-y-1">
            {activeCategories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium transition hover:surface-subtle"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="transition group-hover:text-accent">
                      {category.name}
                    </span>
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: hexToRgba(category.color, 0.12),
                      color: category.color,
                    }}
                  >
                    {category.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Widget>
      )}

      {activeTags.length > 0 && (
        <Widget title="Tags">
          <ul className="flex flex-wrap gap-2">
            {activeTags.map((tag) => (
              <li key={tag.slug}>
                <Link
                  href={`/tag/${tag.slug}`}
                  className="inline-block rounded-full border hairline px-3 py-1.5 text-xs font-medium text-body transition hover:border-brand-500 hover:text-accent"
                >
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        </Widget>
      )}
    </aside>
  );
}
