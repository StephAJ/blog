import type { Metadata } from "next";

import { SettingsForm } from "@/components/admin/settings-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Everything the public site reads at runtime — no redeploy needed."
      />
      <SettingsForm settings={settings} />
    </>
  );
}
