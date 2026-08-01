import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

function pageNumbers(current: number, total: number) {
  const pages: (number | "…")[] = [];
  const push = (value: number | "…") => pages.push(value);

  push(1);
  if (current > 3) push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    push(i);
  }
  if (current < total - 2) push("…");
  if (total > 1) push(total);

  return pages;
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
  className,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const linkClass =
    "grid h-10 min-w-10 place-items-center rounded-lg border hairline px-3 text-sm font-semibold transition hover:border-brand-500 hover:text-accent";

  return (
    <nav aria-label="Pagination" className={cn("flex justify-center gap-1.5", className)}>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" aria-label="Previous page" className={linkClass}>
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <span className={cn(linkClass, "pointer-events-none opacity-40")} aria-hidden>
          <ChevronLeft size={16} />
        </span>
      )}

      {pageNumbers(page, totalPages).map((value, index) =>
        value === "…" ? (
          <span
            key={`gap-${index}`}
            className="grid h-10 min-w-10 place-items-center text-sm text-faint"
          >
            …
          </span>
        ) : value === page ? (
          <span
            key={value}
            aria-current="page"
            className="grid h-10 min-w-10 place-items-center rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white"
          >
            {value}
          </span>
        ) : (
          <Link key={value} href={hrefFor(value)} className={linkClass}>
            {value}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" aria-label="Next page" className={linkClass}>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span className={cn(linkClass, "pointer-events-none opacity-40")} aria-hidden>
          <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}
