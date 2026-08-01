"use client";

import { AlertCircle, Check, Send } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/admin/actions/posts";
import { sendTest } from "@/app/admin/actions/email";

import { SubmitButton } from "./submit-button";
import { Card, inputClass } from "./ui";

export function TestEmailForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(sendTest, {});

  return (
    <Card
      title="Send a test email"
      description="Save your SMTP settings first, then check the credentials actually work."
    >
      <form action={formAction} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <label htmlFor="testEmail" className="sr-only">
            Send test email to
          </label>
          <input
            id="testEmail"
            name="testEmail"
            type="email"
            required
            defaultValue={defaultEmail}
            className={`${inputClass} min-w-0 flex-1`}
          />
          <SubmitButton variant="secondary" icon={<Send size={15} />}>
            Send test
          </SubmitButton>
        </div>

        {state.error && (
          <p className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span className="break-words">{state.error}</span>
          </p>
        )}
        {state.message && (
          <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
            <Check size={15} /> {state.message}
          </p>
        )}
      </form>
    </Card>
  );
}
