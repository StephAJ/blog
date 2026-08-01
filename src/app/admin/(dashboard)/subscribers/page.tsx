import { and, desc, eq, isNotNull } from "drizzle-orm";
import { AlertTriangle, Download, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  AnnouncePostForm,
  BroadcastForm,
} from "@/components/admin/broadcast-form";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminPageHeader, Card, EmptyState } from "@/components/admin/ui";
import { db } from "@/db";
import { getSubscribers } from "@/db/queries";
import { posts } from "@/db/schema";
import { smtpConfigured } from "@/lib/mail";
import { getSettings } from "@/lib/settings";
import { formatDate, relativeTime } from "@/lib/utils";

import { getRecentBroadcasts } from "../../actions/email";
import { deleteSubscriber } from "../../actions/settings";

export const metadata: Metadata = { title: "Subscribers" };
export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const [list, settings, sendable, history] = await Promise.all([
    getSubscribers(),
    getSettings(),
    db
      .select({ id: posts.id, title: posts.title, notifiedAt: posts.notifiedAt })
      .from(posts)
      .where(and(eq(posts.status, "published"), isNotNull(posts.publishedAt)))
      .orderBy(desc(posts.publishedAt))
      .limit(25),
    getRecentBroadcasts(),
  ]);

  const mailReady = smtpConfigured(settings);

  return (
    <>
      <AdminPageHeader
        title="Subscribers"
        description={`${list.length} email${list.length === 1 ? "" : "s"} collected from the site.`}
        actions={
          list.length > 0 ? (
            <a
              href="/api/admin/subscribers.csv"
              download
              className="inline-flex items-center gap-2 rounded-lg border hairline px-4 py-2.5 text-sm font-semibold transition hover:border-brand-500 hover:text-accent"
            >
              <Download size={15} /> Export CSV
            </a>
          ) : undefined
        }
      />

      {!mailReady && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle size={17} className="mt-0.5 shrink-0" />
          <p>
            Sending is switched off until SMTP is configured.{" "}
            <Link href="/admin/settings#email" className="font-semibold underline">
              Add a host and from-address in Settings
            </Link>
            , then send yourself a test.
          </p>
        </div>
      )}

      {mailReady && list.length > 0 && (
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <AnnouncePostForm
            posts={sendable.map((post) => ({
              id: post.id,
              title: post.title,
              notified: Boolean(post.notifiedAt),
            }))}
          />
          <BroadcastForm />
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          title="No subscribers yet"
          description="The signup form appears in the sidebar and footer while the newsletter is enabled in Settings."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border hairline surface">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b hairline text-left">
                <th className="eyebrow px-5 py-3 text-faint">Email</th>
                <th className="eyebrow px-5 py-3 text-faint">Source</th>
                <th className="eyebrow px-5 py-3 text-faint">Subscribed</th>
                <th className="eyebrow px-5 py-3 text-right text-faint">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {list.map((subscriber) => (
                <tr key={subscriber.id} className="transition hover:surface-subtle">
                  <td className="px-5 py-3.5 font-medium">{subscriber.email}</td>
                  <td className="px-5 py-3.5 text-xs text-faint">{subscriber.source}</td>
                  <td className="px-5 py-3.5 text-xs text-faint">
                    {formatDate(subscriber.createdAt, "long")}
                  </td>
                  <td className="px-5 py-3.5">
                    <form action={deleteSubscriber} className="flex justify-end">
                      <input type="hidden" name="id" value={subscriber.id} />
                      <SubmitButton
                        variant="danger"
                        iconOnly
                        title={`Remove ${subscriber.email}`}
                        confirm={`Remove ${subscriber.email} from the list?`}
                      >
                        <Trash2 size={15} />
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {history.length > 0 && (
        <Card title="Recently sent" className="mt-6">
          <ul className="divide-y hairline">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0"
              >
                <span className="font-semibold">{entry.subject}</span>
                <span className="eyebrow rounded-full surface-subtle px-2 py-0.5 text-faint">
                  {entry.kind === "new-post" ? "post" : "broadcast"}
                </span>
                <span className="ml-auto text-xs text-faint">
                  {entry.sentCount} sent
                  {entry.failedCount > 0 && `, ${entry.failedCount} failed`} ·{" "}
                  {relativeTime(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
