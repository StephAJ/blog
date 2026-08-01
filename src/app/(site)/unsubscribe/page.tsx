import { eq } from "drizzle-orm";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { db } from "@/db";
import { subscribers } from "@/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let removed = false;
  if (token && token.length >= 16) {
    const result = await db
      .delete(subscribers)
      .where(eq(subscribers.unsubscribeToken, token))
      .returning({ id: subscribers.id });
    removed = result.length > 0;
  }

  return (
    <div className="container-page py-24">
      <div className="mx-auto max-w-md text-center">
        {removed ? (
          <>
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-50 text-accent dark:bg-brand-950/50">
              <Check size={26} />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold">You&rsquo;re unsubscribed</h1>
            <p className="mt-3 leading-relaxed text-body">
              You won&rsquo;t get any more emails from us. No hard feelings — the
              posts are always here if you want them.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold">Link not recognised</h1>
            <p className="mt-3 leading-relaxed text-body">
              That unsubscribe link has already been used, or it isn&rsquo;t valid.
              If you keep getting emails, reply to one and we&rsquo;ll sort it out.
            </p>
          </>
        )}

        <Link
          href="/"
          className="mt-7 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Back to the blog
        </Link>
      </div>
    </div>
  );
}
