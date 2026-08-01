import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/admin/profile-form";
import { SettingsForm } from "@/components/admin/settings-form";
import { TestEmailForm } from "@/components/admin/test-email-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);
  if (!user) redirect("/admin/login");

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Everything the public site reads at runtime — no redeploy needed."
      />

      <SettingsForm settings={settings} />

      <div className="mt-6 grid gap-6 xl:ml-[15.5rem]">
        <ProfileForm
          values={{
            name: user.name,
            slug: user.slug,
            bio: user.bio ?? "",
            avatarUrl: user.avatarUrl ?? "",
            twitter: user.twitter ?? "",
            website: user.website ?? "",
          }}
        />
        <TestEmailForm defaultEmail={user.email} />
      </div>
    </>
  );
}
