import { Rss } from "lucide-react";
import Link from "next/link";

import { SOCIAL_ICONS } from "@/components/icons/social";
import type { Settings } from "@/db/schema";
import { cn } from "@/lib/utils";

const ORDER = [
  ["twitter", "twitterUrl", "X"],
  ["instagram", "instagramUrl", "Instagram"],
  ["facebook", "facebookUrl", "Facebook"],
  ["linkedin", "linkedinUrl", "LinkedIn"],
  ["github", "githubUrl", "GitHub"],
  ["youtube", "youtubeUrl", "YouTube"],
] as const;

export function SocialLinks({
  settings,
  size = 16,
  className,
  itemClassName,
  showRss = true,
}: {
  settings: Settings;
  size?: number;
  className?: string;
  itemClassName?: string;
  showRss?: boolean;
}) {
  const links = ORDER.filter(([, key]) => settings[key]);

  if (!links.length && !showRss) return null;

  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {links.map(([icon, key, label]) => {
        const Icon = SOCIAL_ICONS[icon];
        return (
          <li key={icon}>
            <a
              href={settings[key] as string}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label={label}
              className={cn(
                "grid size-8 place-items-center rounded-full text-body transition hover:bg-brand-600 hover:text-white",
                itemClassName,
              )}
            >
              <Icon width={size} height={size} />
            </a>
          </li>
        );
      })}
      {showRss && (
        <li>
          <Link
            href="/feed.xml"
            aria-label="RSS feed"
            className={cn(
              "grid size-8 place-items-center rounded-full text-body transition hover:bg-brand-600 hover:text-white",
              itemClassName,
            )}
          >
            <Rss size={size} />
          </Link>
        </li>
      )}
    </ul>
  );
}
