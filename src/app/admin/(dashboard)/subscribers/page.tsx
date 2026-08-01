import { Download, Trash2 } from "lucide-react";
import type { Metadata } from "next";

import { SubmitButton } from "@/components/admin/submit-button";
import { AdminPageHeader, EmptyState } from "@/components/admin/ui";
import { getSubscribers } from "@/db/queries";
import { formatDate } from "@/lib/utils";

import { deleteSubscriber } from "../../actions/settings";

export const metadata: Metadata = { title: "Subscribers" };
export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const list = await getSubscribers();

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
                        className="size-8 p-0"
                        confirm={`Remove ${subscriber.email} from the list?`}
                      >
                        <Trash2 size={14} />
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
