import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageForm } from "@/components/admin/page-form";
import { AdminPageHeader, StatusPill } from "@/components/admin/ui";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { getSettings, siteUrl } from "@/lib/settings";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Edit page" };
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditPagePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { saved } = await searchParams;

  const pageId = Number(id);
  if (!Number.isInteger(pageId)) notFound();

  const page = await db.query.pages.findFirst({ where: eq(pages.id, pageId) });
  if (!page) notFound();

  const settings = await getSettings();

  return (
    <>
      <AdminPageHeader
        title="Edit page"
        description={`Updated ${formatDate(page.updatedAt, "long")}`}
        actions={<StatusPill status={page.status} />}
      />

      <PageForm
        saved={saved === "1"}
        siteUrl={siteUrl(settings.siteUrl)}
        values={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          content: page.content,
          metaDescription: page.metaDescription ?? "",
          status: page.status,
          showInFooter: page.showInFooter,
        }}
      />
    </>
  );
}
