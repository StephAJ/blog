import { MessageCircle } from "lucide-react";

import { getApprovedComments } from "@/db/queries";
import { colorFromString, initials, isoDate, relativeTime } from "@/lib/utils";

import { CommentForm } from "./comment-form";

export async function Comments({
  postId,
  enabled,
}: {
  postId: number;
  enabled: boolean;
}) {
  const list = await getApprovedComments(postId);

  return (
    <section id="comments" className="scroll-mt-28">
      <h2 className="flex items-center gap-2.5 text-xl font-extrabold">
        <MessageCircle size={20} className="text-accent" />
        {list.length === 0
          ? "Comments"
          : `${list.length} comment${list.length === 1 ? "" : "s"}`}
      </h2>

      {list.length > 0 && (
        <ul className="mt-7 space-y-7">
          {list.map((comment) => (
            <li key={comment.id} className="flex gap-4">
              <span
                aria-hidden
                style={{ backgroundColor: colorFromString(comment.authorName) }}
                className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
              >
                {initials(comment.authorName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2.5">
                  <p className="font-bold">
                    {comment.website ? (
                      <a
                        href={comment.website}
                        target="_blank"
                        rel="noopener noreferrer nofollow ugc"
                        className="transition hover:text-accent"
                      >
                        {comment.authorName}
                      </a>
                    ) : (
                      comment.authorName
                    )}
                  </p>
                  <time
                    dateTime={isoDate(comment.createdAt)}
                    className="text-xs text-faint"
                  >
                    {relativeTime(comment.createdAt)}
                  </time>
                </div>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed whitespace-pre-line text-body">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {enabled ? (
        <div className="mt-10 rounded-xl border hairline surface p-6">
          <h3 className="mb-1 text-base font-bold">Leave a comment</h3>
          <p className="mb-5 text-sm text-body">
            Comments are moderated and usually appear within a day.
          </p>
          <CommentForm postId={postId} />
        </div>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed hairline px-5 py-6 text-center text-sm text-faint">
          Comments are closed on this post.
        </p>
      )}
    </section>
  );
}
