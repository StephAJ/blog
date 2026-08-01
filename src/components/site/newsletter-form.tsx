"use client";

import { Check, Loader2, Send } from "lucide-react";
import { useState } from "react";

export function NewsletterForm({
  source = "sidebar",
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setState("loading");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await response.json();

      if (!response.ok) {
        setState("error");
        setMessage(data.error ?? "Something went wrong. Try again?");
        return;
      }

      setState("done");
      setMessage(data.message ?? "You're on the list.");
      setEmail("");
    } catch {
      setState("error");
      setMessage("Network error. Try again?");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-3 text-sm font-medium text-brand-800 dark:bg-brand-950 dark:text-brand-200">
        <Check size={16} className="shrink-0" />
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "" : "space-y-2"}>
      <div className="flex gap-2">
        <label htmlFor={`newsletter-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-${source}`}
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-lg border hairline surface px-3 py-2.5 text-sm outline-none transition focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {state === "loading" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
          <span className={compact ? "sr-only sm:not-sr-only" : ""}>Subscribe</span>
        </button>
      </div>
      {state === "error" && (
        <p className="text-xs text-brand-700 dark:text-brand-400">{message}</p>
      )}
    </form>
  );
}
