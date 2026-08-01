import { Check, ExternalLink, ShieldAlert, Trash2, Undo2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SubmitButton } from "@/components/admin/submit-button";
import { AdminPageHeader, EmptyState, StatusPill } from "@/components/admin/ui";
import { getAdminComments } from "@/db/queries";
import { cn, colorFromString, initials, relativeTime } from "@/lib/utils";

import { deleteComment, setCommentStatus } from "../../actions/comments";

export const metadata: Metadata = { title: "Comments" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ status?: string }> };

const FILTERS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Spam", value: "spam" },
  { label: "All", value: "" },
] as const;

export default async function CommentsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const active =
    status === "approved" || status === "spam" || status === "pending"
      ? status
      : undefined;

  const list = await getAdminComments(active);

  return (
    <>
      <AdminPageHeader
        title="Comments"
        description="Approve what belongs, bin what does not."
      />

      <div className="mb-5 flex flex-wrap gap-1.5">
        {FILTERS.map((filter) => (
          <Link
            key={filter.label}
            href={filter.value ? `/admin/comments?status=${filter.value}` : "/admin/comments"}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-semibold transition",
              (active ?? "") === filter.value
                ? "bg-brand-600 text-white"
                : "border hairline text-body hover:border-brand-500 hover:text-accent",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="Nothing here"
          description={
            active === "pending"
              ? "No comments are waiting for moderation."
              : "No comments match this filter."
          }
        />
      ) : (
        <ul className="space-y-4">
          {list.map((comment) => (
            <li key={comment.id} className="rounded-xl border hairline surface p-5">
              <div className="flex flex-wrap items-start gap-4">
                <span
                  aria-hidden
                  style={{ backgroundColor: colorFromString(comment.authorName) }}
                  className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                >
                  {initials(comment.authorName)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <p className="font-bold">{comment.authorName}</p>
                    <StatusPill status={comment.status} />
                    <span className="text-xs text-faint">
                      {relativeTime(comment.createdAt)}
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-faint">
                    {comment.authorEmail}
                    {comment.website && (
                      <>
                        {" · "}
                        <a
                          href={comment.website}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="transition hover:text-accent"
                        >
                          {comment.website.replace(/^https?:\/\//, "")}
                        </a>
                      </>
                    )}
                  </p>

                  <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-body">
                    {comment.content}
                  </p>

                  <Link
                    href={`/${comment.post.slug}#comments`}
                    target="_blank"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent transition hover:underline"
                  >
                    <ExternalLink size={12} /> {comment.post.title}
                  </Link>
                </div>

                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {comment.status !== "approved" && (
                    <form action={setCommentStatus}>
                      <input type="hidden" name="id" value={comment.id} />
                      <input type="hidden" name="status" value="approved" />
                      <SubmitButton
                        variant="secondary"
                        className="px-3 py-2 text-xs"
                        icon={<Check size={13} />}
                      >
                        Approve
                      </SubmitButton>
                    </form>
                  )}

                  {comment.status === "approved" && (
                    <form action={setCommentStatus}>
                      <input type="hidden" name="id" value={comment.id} />
                      <input type="hidden" name="status" value="pending" />
                      <SubmitButton
                        variant="secondary"
                        className="px-3 py-2 text-xs"
                        icon={<Undo2 size={13} />}
                      >
                        Unapprove
                      </SubmitButton>
                    </form>
                  )}

                  {comment.status !== "spam" && (
                    <form action={setCommentStatus}>
                      <input type="hidden" name="id" value={comment.id} />
                      <input type="hidden" name="status" value="spam" />
                      <SubmitButton
                        variant="secondary"
                        className="px-3 py-2 text-xs"
                        icon={<ShieldAlert size={13} />}
                      >
                        Spam
                      </SubmitButton>
                    </form>
                  )}

                  <form action={deleteComment}>
                    <input type="hidden" name="id" value={comment.id} />
                    <SubmitButton
                      variant="danger"
                      className="px-3 py-2 text-xs"
                      icon={<Trash2 size={13} />}
                      confirm="Delete this comment permanently?"
                    >
                      Delete
                    </SubmitButton>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
