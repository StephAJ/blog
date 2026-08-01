import { SmartImage as Image } from "@/components/smart-image";
import Link from "next/link";

import { AdSlot } from "@/components/ads/ad-slot";
import { getCategoriesWithCounts, getFooterPages } from "@/db/queries";
import { getSettings } from "@/lib/settings";

import { NewsletterForm } from "./newsletter-form";
import { SocialLinks } from "./social-links";

export async function SiteFooter() {
  const [settings, categories, pages] = await Promise.all([
    getSettings(),
    getCategoriesWithCounts(),
    getFooterPages(),
  ]);

  const topCategories = categories.filter((c) => c.count > 0).slice(0, 6);

  return (
    <footer className="mt-20 border-t hairline surface-subtle">
      <AdSlot placement="footer" className="container-page pt-10" />

      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <Link href="/" className="flex items-center gap-2.5">
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt=""
                width={200}
                height={200}
                className="size-10 object-contain invert dark:invert-0"
                unoptimized
              />
            ) : (
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-lg bg-brand-600 font-bold text-white"
              >
                {settings.siteName.charAt(0)}
              </span>
            )}
            <span className="text-lg font-extrabold tracking-tight">
              {settings.siteName}
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-body">
            {settings.footerNote || settings.description}
          </p>
          <SocialLinks
            settings={settings}
            className="mt-5 -ml-2"
            itemClassName="border hairline"
          />
        </div>

        <nav aria-label="Topics" className="lg:col-span-2">
          <h2 className="eyebrow mb-4 text-faint">Topics</h2>
          <ul className="space-y-2.5 text-sm">
            {topCategories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="link-underline text-body transition hover:text-accent"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Site" className="lg:col-span-2">
          <h2 className="eyebrow mb-4 text-faint">Site</h2>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                href="/archive"
                className="link-underline text-body transition hover:text-accent"
              >
                Archive
              </Link>
            </li>
            {pages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/${page.slug}`}
                  className="link-underline text-body transition hover:text-accent"
                >
                  {page.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/feed.xml"
                className="link-underline text-body transition hover:text-accent"
              >
                RSS feed
              </Link>
            </li>
          </ul>
        </nav>

        {settings.newsletterEnabled && (
          <div className="lg:col-span-3">
            <h2 className="eyebrow mb-4 text-faint">Newsletter</h2>
            <p className="mb-3 text-sm leading-relaxed text-body">
              New posts in your inbox. No spam, unsubscribe anytime.
            </p>
            <NewsletterForm source="footer" compact />
          </div>
        )}
      </div>

      <div className="border-t hairline">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-faint sm:flex-row">
          <p>
            {settings.copyright ||
              `© ${new Date().getFullYear()} ${settings.siteName}. All rights reserved.`}
          </p>
          <p className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="transition hover:text-accent">
              Sitemap
            </Link>
            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="transition hover:text-accent"
              >
                {settings.contactEmail}
              </a>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
