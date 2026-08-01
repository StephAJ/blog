import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getCategoriesWithCounts, getFooterPages } from "@/db/queries";
import { getSettings } from "@/lib/settings";

import { MobileNav } from "./mobile-nav";
import { SearchButton } from "./search-button";
import { ThemeToggle } from "./theme-toggle";

const PRIMARY_NAV_COUNT = 4;

export async function SiteHeader() {
  const [settings, categories, pages] = await Promise.all([
    getSettings(),
    getCategoriesWithCounts(),
    getFooterPages(),
  ]);

  const withPosts = categories.filter((category) => category.count > 0);
  const primary = withPosts.slice(0, PRIMARY_NAV_COUNT);
  const overflow = withPosts.slice(PRIMARY_NAV_COUNT);

  return (
    <header className="sticky top-0 z-50 border-b hairline bg-[var(--surface-page)]/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {settings.logoUrl ? (
            <Image
              src={settings.logoUrl}
              alt=""
              width={200}
              height={200}
              // The supplied mark is white on transparent, so it would vanish
              // on the light canvas — invert it there, leave it in dark mode.
              className="size-10 object-contain invert dark:invert-0"
              priority
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

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-[0.9rem] font-semibold">
            <li>
              <Link
                href="/"
                className="rounded-full px-3 py-2 transition hover:text-accent"
              >
                Home
              </Link>
            </li>
            {primary.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="rounded-full px-3 py-2 transition hover:text-accent"
                >
                  {category.name}
                </Link>
              </li>
            ))}

            {(overflow.length > 0 || pages.length > 0) && (
              <li className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-full px-3 py-2 transition group-hover:text-accent"
                  aria-haspopup="true"
                >
                  More <ChevronDown size={14} />
                </button>
                <div className="invisible absolute left-0 top-full w-60 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="overflow-hidden rounded-xl border hairline surface py-2 shadow-lift">
                    {overflow.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="flex items-center justify-between px-4 py-2 text-sm font-medium transition hover:surface-subtle hover:text-accent"
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </span>
                        <span className="text-xs text-faint">{category.count}</span>
                      </Link>
                    ))}
                    {overflow.length > 0 && pages.length > 0 && (
                      <hr className="my-2 border-t hairline" />
                    )}
                    {pages.map((page) => (
                      <Link
                        key={page.slug}
                        href={`/${page.slug}`}
                        className="block px-4 py-2 text-sm font-medium transition hover:surface-subtle hover:text-accent"
                      >
                        {page.title}
                      </Link>
                    ))}
                    <Link
                      href="/archive"
                      className="block px-4 py-2 text-sm font-medium transition hover:surface-subtle hover:text-accent"
                    >
                      Archive
                    </Link>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <SearchButton />
          <ThemeToggle />
          <MobileNav categories={withPosts} pages={pages} />
        </div>
      </div>
    </header>
  );
}
