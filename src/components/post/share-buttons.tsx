"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useState } from "react";

import {
  FacebookIcon,
  LinkedinIcon,
  XIcon,
} from "@/components/icons/social";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: XIcon,
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookIcon,
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: LinkedinIcon,
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the visible URL is still selectable.
    }
  }

  async function nativeShare() {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title, url });
    } catch {
      // User dismissed the share sheet.
    }
  }

  const buttonClass =
    "grid size-9 place-items-center rounded-full border hairline text-body transition hover:border-brand-500 hover:bg-brand-600 hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-1 text-faint">Share</span>

      {targets.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={buttonClass}
        >
          <Icon width={15} height={15} />
        </a>
      ))}

      <button type="button" onClick={copy} aria-label="Copy link" className={buttonClass}>
        {copied ? <Check size={15} /> : <Link2 size={15} />}
      </button>

      <button
        type="button"
        onClick={nativeShare}
        aria-label="Share"
        className={`${buttonClass} sm:hidden`}
      >
        <Share2 size={15} />
      </button>
    </div>
  );
}
