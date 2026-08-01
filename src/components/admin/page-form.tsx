"use client";

import { AlertCircle, Check, ExternalLink, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { deletePage, savePage } from "@/app/admin/actions/pages";
import type { ActionState } from "@/app/admin/actions/posts";
import { slugify } from "@/lib/utils";

import { RichEditor } from "./rich-editor";
import { SubmitButton } from "./submit-button";
import { Card, Field, Toggle, inputClass } from "./ui";

export type PageFormValues = {
  id?: number;
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  status: "draft" | "published";
  showInFooter: boolean;
};

export function PageForm({
  values,
  siteUrl,
  saved,
}: {
  values: PageFormValues;
  siteUrl: string;
  saved?: boolean;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(savePage, {});
  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(values.slug));

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1fr_21rem]">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="min-w-0 space-y-6">
        <div>
          <label htmlFor="title" className="sr-only">
            Page title
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            placeholder="Page title"
            required
            className="w-full bg-transparent text-3xl font-extrabold tracking-tight outline-none placeholder:text-[var(--text-muted)]"
          />
          <div className="mt-2 flex items-center gap-2 text-xs text-faint">
            <span className="shrink-0 font-mono">{siteUrl}/</span>
            <input
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugTouched(true);
              }}
              aria-label="URL slug"
              className="min-w-0 flex-1 border-b border-dashed hairline bg-transparent py-0.5 font-mono outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <RichEditor
          name="content"
          defaultValue={values.content}
          placeholder="Write the page…"
        />
      </div>

      <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <Card>
          <div className="space-y-4">
            <Field label="Status" htmlFor="status">
              <select
                id="status"
                name="status"
                defaultValue={values.status}
                className={inputClass}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>

            <Field
              label="Meta description"
              htmlFor="metaDescription"
              hint="Shown in search results."
            >
              <textarea
                id="metaDescription"
                name="metaDescription"
                defaultValue={values.metaDescription}
                rows={3}
                maxLength={320}
                className={`${inputClass} resize-y`}
              />
            </Field>

            <Toggle
              name="showInFooter"
              label="Link from the footer"
              hint="Also appears in the header's More menu."
              defaultChecked={values.showInFooter}
            />

            {state.error && (
              <p className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={15} className="mt-0.5 shrink-0" /> {state.error}
              </p>
            )}
            {(state.message || saved) && !state.error && (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
                <Check size={15} /> {state.message ?? "Saved."}
              </p>
            )}

            <div className="flex gap-2">
              <SubmitButton icon={<Save size={15} />} className="flex-1">
                Save page
              </SubmitButton>
              {values.id && (
                <Link
                  href={`/${slug}`}
                  target="_blank"
                  aria-label="View page"
                  className="grid size-11 place-items-center rounded-lg border hairline text-body transition hover:border-brand-500 hover:text-accent"
                >
                  <ExternalLink size={15} />
                </Link>
              )}
            </div>
          </div>
        </Card>

        {values.id && (
          <SubmitButton
            variant="danger"
            className="w-full"
            icon={<Trash2 size={15} />}
            formAction={deletePage}
            confirm="Delete this page permanently?"
          >
            Delete page
          </SubmitButton>
        )}
      </div>
    </form>
  );
}
