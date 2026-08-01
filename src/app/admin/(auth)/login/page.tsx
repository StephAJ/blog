import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getSession()) redirect("/admin");

  const { next } = await searchParams;
  const settings = await getSettings();

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-lg bg-brand-600 text-lg font-bold text-white"
          >
            {settings.siteName.charAt(0)}
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            {settings.siteName}
          </span>
        </Link>

        <div className="rounded-xl border hairline surface p-7 shadow-card">
          <h1 className="text-xl font-extrabold">Sign in</h1>
          <p className="mt-1.5 mb-6 text-sm text-body">
            Enter your credentials to reach the dashboard.
          </p>
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-center text-xs text-faint">
          <Link href="/" className="transition hover:text-accent">
            ← Back to the blog
          </Link>
        </p>
      </div>
    </div>
  );
}
