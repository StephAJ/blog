"use client";

import {
  FileText,
  Files,
  Folder,
  Image as ImageIcon,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Posts", Icon: FileText },
  { href: "/admin/pages", label: "Pages", Icon: Files },
  { href: "/admin/categories", label: "Categories", Icon: Folder },
  { href: "/admin/tags", label: "Tags", Icon: Tag },
  { href: "/admin/comments", label: "Comments", Icon: MessageCircle, badgeKey: "comments" },
  { href: "/admin/media", label: "Media", Icon: ImageIcon },
  { href: "/admin/subscribers", label: "Subscribers", Icon: Users },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
] as const;

export function AdminNav({ badges }: { badges: { comments: number } }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin">
      <ul className="space-y-0.5">
        {ITEMS.map(({ href, label, Icon, ...rest }) => {
          const exact = "exact" in rest && rest.exact;
          const active = exact ? pathname === href : pathname.startsWith(href);
          const badge =
            "badgeKey" in rest && rest.badgeKey === "comments" ? badges.comments : 0;

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                  active
                    ? "bg-brand-600 text-white"
                    : "text-body hover:surface-subtle hover:text-accent",
                )}
              >
                <Icon size={17} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[0.6875rem] font-bold",
                      active ? "bg-white/20" : "bg-brand-600 text-white",
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
