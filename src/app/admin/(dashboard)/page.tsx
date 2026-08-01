import {
  Eye,
  FileText,
  MessageCircle,
  PenLine,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";

import { AdminPageHeader, Card, StatusPill } from "@/components/admin/ui";
import {
  getAdminComments,
  getAdminStats,
  getPopularPosts,
  getRecentActivity,
} from "@/db/queries";
import { getSettings } from "@/lib/settings";
import { formatDate, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

function Stat({
  label,
  value,
  Icon,
  href,
}: {
  label: string;
  value: number | string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="card-hover rounded-xl border hairline surface p-5 transition"
    >
      <div className="flex items-center justify-between">
        <p className="eyebrow text-faint">{label}</p>
        <Icon size={16} className="text-accent" />
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
    </Link>
  );
}

export default async function AdminDashboard() {
  const [stats, recent, popular, pending, settings] = await Promise.all([
    getAdminStats(),
    getRecentActivity(6),
    getPopularPosts(5),
    getAdminComments("pending"),
    getSettings(),
  ]);

  const compact = (n: number) =>
    Intl.NumberFormat("en", { notation: "compact" }).format(n);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={`What's happening on ${settings.siteName}.`}
        actions={
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus size={15} /> New post
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Published" value={stats.published} Icon={FileText} href="/admin/posts?status=published" />
        <Stat label="Drafts" value={stats.drafts} Icon={PenLine} href="/admin/posts?status=draft" />
        <Stat label="Total views" value={compact(stats.views)} Icon={Eye} href="/admin/posts" />
        <Stat label="Subscribers" value={stats.subscribers} Icon={Users} href="/admin/subscribers" />
      </div>

      {stats.pendingComments > 0 && (
        <Link
          href="/admin/comments?status=pending"
          className="mt-4 flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-amber-700 transition hover:bg-amber-500/15 dark:text-amber-400"
        >
          <MessageCircle size={17} />
          {stats.pendingComments} comment{stats.pendingComments === 1 ? "" : "s"} waiting
          for moderation →
        </Link>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title="Recently edited">
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-faint">Nothing yet.</p>
          ) : (
            <ul className="divide-y hairline">
              {recent.map((post) => (
                <li key={post.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="clamp-1 text-sm font-semibold transition hover:text-accent"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-faint">
                      {relativeTime(post.updatedAt)} · {post.views} views
                    </p>
                  </div>
                  <StatusPill status={post.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Most read">
          {popular.length === 0 ? (
            <p className="py-6 text-center text-sm text-faint">No data yet.</p>
          ) : (
            <ul className="divide-y hairline">
              {popular.map((post, index) => (
                <li key={post.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="w-6 text-lg font-extrabold text-[var(--border-strong)]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/${post.slug}`}
                      target="_blank"
                      className="clamp-1 text-sm font-semibold transition hover:text-accent"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-faint">
                      {formatDate(post.publishedAt, "short")}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-faint">
                    {compact(post.views)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {pending.length > 0 && (
        <Card
          title="Awaiting moderation"
          className="mt-6"
          footer={
            <Link
              href="/admin/comments"
              className="text-sm font-semibold text-accent transition hover:underline"
            >
              Moderate all comments →
            </Link>
          }
        >
          <ul className="divide-y hairline">
            {pending.slice(0, 4).map((comment) => (
              <li key={comment.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm">
                  <span className="font-semibold">{comment.authorName}</span>{" "}
                  <span className="text-faint">on</span>{" "}
                  <span className="font-medium">{comment.post.title}</span>
                </p>
                <p className="clamp-2 mt-1 text-sm text-body">{comment.content}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
