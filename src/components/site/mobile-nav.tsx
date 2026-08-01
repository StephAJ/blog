"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavCategory = { name: string; slug: string; color: string; count: number };
type NavPage = { title: string; slug: string };

export function MobileNav({
  categories,
  pages,
}: {
  categories: NavCategory[];
  pages: NavPage[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-full border hairline text-body transition hover:border-brand-500 lg:hidden"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            role="presentation"
          />
          <nav
            aria-label="Mobile"
            className="absolute inset-y-0 right-0 flex w-[min(21rem,88vw)] flex-col overflow-y-auto surface shadow-lift"
          >
            <div className="flex items-center justify-between border-b hairline px-5 py-4">
              <span className="eyebrow text-faint">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-full border hairline"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-6">
              <p className="eyebrow mb-3 text-faint">Browse</p>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/"
                    className="block rounded-lg px-3 py-2.5 text-[0.95rem] font-semibold transition hover:surface-subtle"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/archive"
                    className="block rounded-lg px-3 py-2.5 text-[0.95rem] font-semibold transition hover:surface-subtle"
                  >
                    Archive
                  </Link>
                </li>
                {pages.map((page) => (
                  <li key={page.slug}>
                    <Link
                      href={`/${page.slug}`}
                      className="block rounded-lg px-3 py-2.5 text-[0.95rem] font-semibold transition hover:surface-subtle"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="eyebrow mt-8 mb-3 text-faint">Topics</p>
              <ul className="space-y-1">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[0.95rem] transition hover:surface-subtle"
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
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
