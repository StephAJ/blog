import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-faint">
        <li>
          <Link href="/" className="transition hover:text-accent">
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1">
            <ChevronRight size={12} aria-hidden />
            {item.href ? (
              <Link href={item.href} className="transition hover:text-accent">
                {item.label}
              </Link>
            ) : (
              <span className="clamp-1 max-w-[16rem] text-body">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
