import { ExternalLink, Pencil, Plus } from "lucide-react";
import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader, EmptyState, StatusPill } from "@/components/admin/ui";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Pages" };
export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const list = await db.select().from(pages).orderBy(desc(pages.updatedAt));

  return (
    <>
      <AdminPageHeader
        title="Pages"
        description="Standalone pages like About, Contact and Privacy — no date, no category."
        actions={
          <Link
            href="/admin/pages/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus size={15} /> New page
          </Link>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          title="No pages yet"
          description="An About and a Contact page are the usual starting point."
          action={
            <Link
              href="/admin/pages/new"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <Plus size={15} /> New page
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border hairline surface">
          <table className="w-full min-w-[38rem] text-sm">
            <thead>
              <tr className="border-b hairline text-left">
                <th className="eyebrow px-5 py-3 text-faint">Title</th>
                <th className="eyebrow px-5 py-3 text-faint">Status</th>
                <th className="eyebrow px-5 py-3 text-faint">In footer</th>
                <th className="eyebrow px-5 py-3 text-faint">Updated</th>
                <th className="eyebrow px-5 py-3 text-right text-faint">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {list.map((page) => (
                <tr key={page.id} className="transition hover:surface-subtle">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="font-semibold transition hover:text-accent"
                    >
                      {page.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-xs text-faint">/{page.slug}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={page.status} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-faint">
                    {page.showInFooter ? "Yes" : "No"}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-faint">
                    {relativeTime(page.updatedAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {page.status === "published" && (
                        <Link
                          href={`/${page.slug}`}
                          target="_blank"
                          aria-label={`View ${page.title}`}
                          className="grid size-8 place-items-center rounded-lg border hairline text-body transition hover:border-brand-500 hover:text-accent"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      )}
                      <Link
                        href={`/admin/pages/${page.id}`}
                        aria-label={`Edit ${page.title}`}
                        className="grid size-8 place-items-center rounded-lg border hairline text-body transition hover:border-brand-500 hover:text-accent"
                      >
                        <Pencil size={14} />
                      </Link>
                    </div>
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
