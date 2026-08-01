import Link from "next/link";

import { cn, contrastText, hexToRgba } from "@/lib/utils";

import type { CardCategory } from "./types";

export function CategoryBadge({
  category,
  variant = "soft",
  className,
}: {
  category: CardCategory;
  variant?: "soft" | "solid";
  className?: string;
}) {
  const style =
    variant === "solid"
      ? { backgroundColor: category.color, color: contrastText(category.color) }
      : { backgroundColor: hexToRgba(category.color, 0.13), color: category.color };

  return (
    <Link
      href={`/category/${category.slug}`}
      style={style}
      className={cn(
        "eyebrow inline-flex items-center rounded-full px-2.5 py-1 transition hover:brightness-95",
        className,
      )}
    >
      {category.name}
    </Link>
  );
}
