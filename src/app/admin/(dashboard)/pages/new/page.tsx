import type { Metadata } from "next";

import { PageForm } from "@/components/admin/page-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { getSettings, siteUrl } from "@/lib/settings";

export const metadata: Metadata = { title: "New page" };
export const dynamic = "force-dynamic";

export default async function NewPagePage() {
  const settings = await getSettings();

  return (
    <>
      <AdminPageHeader title="New page" />
      <PageForm
        siteUrl={siteUrl(settings.siteUrl)}
        values={{
          title: "",
          slug: "",
          content: "",
          metaDescription: "",
          status: "published",
          showInFooter: true,
        }}
      />
    </>
  );
}
