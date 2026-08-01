import { ExternalLink, LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminStats } from "@/db/queries";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { initials } from "@/lib/utils";

import { logout } from "../auth-actions";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The cookie only proves the token was signed by us — the account behind it
  // can still be gone (deleted, or the database reseeded underneath a live
  // session). Verify the row exists here so every admin page agrees, instead
  // of each one failing differently.
  //
  // The cookie is cleared by the login page rather than here: a Server
  // Component render cannot mutate cookies.
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const session = { name: user.name, email: user.email };
  const [settings, stats] = await Promise.all([getSettings(), getAdminStats()]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b hairline surface lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2.5 border-b hairline px-5 py-4">
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-lg bg-brand-600 font-bold text-white"
            >
              {settings.siteName.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{settings.siteName}</p>
              <p className="text-xs text-faint">Admin</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <AdminNav badges={{ comments: stats.pendingComments }} />
          </div>

          <div className="border-t hairline p-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-body transition hover:surface-subtle hover:text-accent"
            >
              <ExternalLink size={17} />
              View site
            </Link>

            <div className="mt-2 flex items-center gap-3 rounded-lg surface-subtle px-3 py-2.5">
              <span
                aria-hidden
                className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white"
              >
                {initials(session.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{session.name}</p>
                <p className="truncate text-xs text-faint">{session.email}</p>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  className="grid size-8 place-items-center rounded-lg text-faint transition hover:bg-red-500 hover:text-white"
                >
                  <LogOut size={15} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-5 py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
