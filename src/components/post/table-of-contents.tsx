"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type Heading = { id: string; text: string; level: 2 | 3 };

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 },
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-xl border hairline surface p-5">
      <h2 className="eyebrow mb-3 flex items-center gap-2 text-faint">
        <span className="h-3 w-0.5 rounded-full bg-brand-600" />
        On this page
      </h2>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block border-l-2 py-1.5 leading-snug transition",
                heading.level === 3 ? "pl-6" : "pl-3",
                activeId === heading.id
                  ? "border-brand-600 font-semibold text-accent"
                  : "border-transparent text-body hover:border-[var(--border-strong)] hover:text-accent",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
