"use client";

import { Check, Loader2, Send } from "lucide-react";
import { useState } from "react";

export function CommentForm({ postId }: { postId: number }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState("loading");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, postId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setState("error");
        setMessage(payload.error ?? "Could not post your comment.");
        return;
      }

      setState("done");
      setMessage(payload.message);
      form.reset();
    } catch {
      setState("error");
      setMessage("Network error. Try again?");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 rounded-xl border hairline bg-brand-50 px-4 py-4 text-sm font-medium text-brand-800 dark:bg-brand-950/50 dark:text-brand-200">
        <Check size={16} className="shrink-0" /> {message}
      </p>
    );
  }

  const fieldClass =
    "w-full rounded-lg border hairline surface px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="comment-name" className="mb-1.5 block text-xs font-semibold">
            Name <span className="text-accent">*</span>
          </label>
          <input id="comment-name" name="authorName" required maxLength={80} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="comment-email" className="mb-1.5 block text-xs font-semibold">
            Email <span className="text-accent">*</span>
          </label>
          <input
            id="comment-email"
            name="authorEmail"
            type="email"
            required
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-faint">Never published.</p>
        </div>
      </div>

      <div>
        <label htmlFor="comment-website" className="mb-1.5 block text-xs font-semibold">
          Website
        </label>
        <input
          id="comment-website"
          name="website"
          type="url"
          placeholder="https://"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="comment-body" className="mb-1.5 block text-xs font-semibold">
          Comment <span className="text-accent">*</span>
        </label>
        <textarea
          id="comment-body"
          name="content"
          required
          rows={5}
          maxLength={3000}
          className={`${fieldClass} resize-y`}
        />
      </div>

      {/* Honeypot — real users never see or fill this. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor="comment-url">Leave this empty</label>
        <input id="comment-url" name="url" tabIndex={-1} autoComplete="off" />
      </div>

      {state === "error" && (
        <p className="text-sm text-brand-700 dark:text-brand-400">{message}</p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "loading" ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Send size={15} />
        )}
        Post comment
      </button>
    </form>
  );
}
