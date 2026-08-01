"use client";

import { AlertCircle, Check, Megaphone, Send } from "lucide-react";
import { useActionState, useState } from "react";

import { announcePost, sendBroadcast } from "@/app/admin/actions/email";
import type { ActionState } from "@/app/admin/actions/posts";

import { RichEditor } from "./rich-editor";
import { SubmitButton } from "./submit-button";
import { Card, Field, Toggle, inputClass } from "./ui";

type PostOption = { id: number; title: string; notified: boolean };

function Feedback({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
        <AlertCircle size={15} className="mt-0.5 shrink-0" />
        <span className="break-words">{state.error}</span>
      </p>
    );
  }
  if (state.message) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
        <Check size={15} /> {state.message}
      </p>
    );
  }
  return null;
}

export function AnnouncePostForm({ posts }: { posts: PostOption[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(announcePost, {});
  const [selected, setSelected] = useState(String(posts[0]?.id ?? ""));

  const current = posts.find((post) => String(post.id) === selected);

  if (posts.length === 0) return null;

  return (
    <Card
      title="Announce a post"
      description="Emails every subscriber a link to the post you choose."
    >
      <form action={formAction} className="space-y-4">
        <Field label="Post" htmlFor="announce-post">
          <select
            id="announce-post"
            name="postId"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className={inputClass}
          >
            {posts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
                {post.notified ? " — already sent" : ""}
              </option>
            ))}
          </select>
        </Field>

        {current?.notified && (
          <Toggle
            name="force"
            label="Send again"
            hint="This post has already been announced once. Tick to re-send anyway."
          />
        )}

        <Feedback state={state} />

        <SubmitButton icon={<Megaphone size={15} />}>Send announcement</SubmitButton>
      </form>
    </Card>
  );
}

export function BroadcastForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(sendBroadcast, {});

  return (
    <Card
      title="Write a broadcast"
      description="A one-off email to everyone on the list. Each message carries its own unsubscribe link."
    >
      <form action={formAction} className="space-y-4">
        <Field label="Subject" htmlFor="broadcast-subject" required>
          <input
            id="broadcast-subject"
            name="subject"
            required
            maxLength={200}
            className={inputClass}
          />
        </Field>

        <div>
          <p className="mb-1.5 text-xs font-semibold">Message</p>
          <RichEditor name="body" placeholder="Write your email…" />
        </div>

        <Feedback state={state} />

        <SubmitButton icon={<Send size={15} />}>Send to all subscribers</SubmitButton>
      </form>
    </Card>
  );
}
