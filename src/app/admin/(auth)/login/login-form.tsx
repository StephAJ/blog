"use client";

import { AlertCircle, LogIn } from "lucide-react";
import { useActionState } from "react";

import { SubmitButton } from "@/components/admin/submit-button";
import { Field, inputClass } from "@/components/admin/ui";

import { login, type LoginState } from "../../auth-actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      <Field label="Email" htmlFor="email" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className={inputClass}
        />
      </Field>

      <Field label="Password" htmlFor="password" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>

      {state.error && (
        <p className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {state.error}
        </p>
      )}

      <SubmitButton className="w-full" icon={<LogIn size={15} />}>
        Sign in
      </SubmitButton>
    </form>
  );
}
