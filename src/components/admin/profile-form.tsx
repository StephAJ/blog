"use client";

import { AlertCircle, Check, Save } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/admin/actions/posts";
import { saveProfile } from "@/app/admin/actions/profile";

import { ImagePicker } from "./image-picker";
import { SubmitButton } from "./submit-button";
import { Card, Field, inputClass } from "./ui";

export type ProfileValues = {
  name: string;
  slug: string;
  bio: string;
  avatarUrl: string;
  twitter: string;
  website: string;
};

export function ProfileForm({ values }: { values: ProfileValues }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveProfile, {});

  return (
    <Card
      title="Author profile"
      description="Shown on the author box under every post and on your author page."
    >
      <form action={formAction} className="grid gap-4 sm:grid-cols-2">
        <Field label="Display name" htmlFor="profile-name" required>
          <input
            id="profile-name"
            name="name"
            defaultValue={values.name}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Author URL" htmlFor="profile-slug" hint={`/author/${values.slug}`}>
          <input
            id="profile-slug"
            name="slug"
            defaultValue={values.slug}
            className={`${inputClass} font-mono text-xs`}
          />
        </Field>

        <div className="sm:col-span-2">
          <ImagePicker
            name="avatarUrl"
            defaultValue={values.avatarUrl}
            label="Profile picture"
          />
          <p className="mt-1.5 text-xs text-faint">
            Used in the author box and post bylines. Falls back to your initials
            when empty.
          </p>
        </div>

        <Field label="Bio" htmlFor="profile-bio" className="sm:col-span-2">
          <textarea
            id="profile-bio"
            name="bio"
            rows={3}
            maxLength={600}
            defaultValue={values.bio}
            className={`${inputClass} resize-y`}
          />
        </Field>

        <Field label="X handle" htmlFor="profile-twitter" hint="Without the @.">
          <input
            id="profile-twitter"
            name="twitter"
            defaultValue={values.twitter}
            className={inputClass}
          />
        </Field>

        <Field label="Website" htmlFor="profile-website">
          <input
            id="profile-website"
            name="website"
            type="url"
            defaultValue={values.website}
            className={inputClass}
          />
        </Field>

        <Field
          label="New password"
          htmlFor="profile-password"
          hint="Leave blank to keep your current one. Minimum 10 characters."
          className="sm:col-span-2"
        >
          <input
            id="profile-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            className={inputClass}
          />
        </Field>

        {state.error && (
          <p className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-600 sm:col-span-2 dark:text-red-400">
            <AlertCircle size={15} className="mt-0.5 shrink-0" /> {state.error}
          </p>
        )}
        {state.message && (
          <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 sm:col-span-2 dark:text-emerald-400">
            <Check size={15} /> {state.message}
          </p>
        )}

        <div className="sm:col-span-2">
          <SubmitButton icon={<Save size={15} />}>Save profile</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
