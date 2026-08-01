import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  description,
  href,
  linkLabel = "View all",
  className,
  as: Tag = "h2",
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div
      className={cn(
        "mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b hairline pb-4",
        className,
      )}
    >
      <div>
        <Tag className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</Tag>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-body">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent transition hover:gap-1.5"
        >
          {linkLabel} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
