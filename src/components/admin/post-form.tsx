"use client";

import { AlertCircle, Check, ExternalLink, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import type { Category } from "@/db/schema";
import { slugify } from "@/lib/utils";

import { deletePost, savePost, type ActionState } from "@/app/admin/actions/posts";
import { ImagePicker } from "./image-picker";
import { RichEditor } from "./rich-editor";
import { SubmitButton } from "./submit-button";
import { Card, Field, Toggle, inputClass } from "./ui";

export type PostFormValues = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  categoryId: number | null;
  tagList: string;
  status: "draft" | "published";
  featured: boolean;
  pinned: boolean;
  allowComments: boolean;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
  noindex: boolean;
  publishedAt: string;
};

function toLocalInput(value: string) {
  return value ? value.slice(0, 16) : "";
}

export function PostForm({
  values,
  categories,
  siteUrl,
  saved,
}: {
  values: PostFormValues;
  categories: Category[];
  siteUrl: string;
  saved?: boolean;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(savePost, {});
  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(values.slug));
  const [excerpt, setExcerpt] = useState(values.excerpt);
  const [metaTitle, setMetaTitle] = useState(values.metaTitle);
  const [metaDescription, setMetaDescription] = useState(values.metaDescription);

  const effectiveSlug = slug || slugify(title);
  const previewTitle = metaTitle || title || "Untitled post";
  const previewDescription = metaDescription || excerpt || "No description yet.";

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1fr_21rem]">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      {/* ---------------------------------------------------------- Main */}
      <div className="min-w-0 space-y-6">
        <div>
          <label htmlFor="title" className="sr-only">
            Post title
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            placeholder="Post title"
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
              placeholder="url-slug"
              aria-label="URL slug"
              className="min-w-0 flex-1 border-b border-dashed hairline bg-transparent py-0.5 font-mono outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <RichEditor name="content" defaultValue={values.content} />

        <Card title="Excerpt" description="Shown on cards, feeds and search results.">
          <textarea
            name="excerpt"
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Leave blank to generate one from the opening paragraph."
            className={`${inputClass} resize-y`}
          />
          <p className="mt-1.5 text-xs text-faint">{excerpt.length}/500</p>
        </Card>

        <Card title="Search engine listing" description="How this post appears on Google.">
          <div className="mb-5 rounded-lg border hairline surface-subtle p-4">
            <p className="text-xs text-faint">
              {siteUrl.replace(/^https?:\/\//, "")} › {effectiveSlug || "url-slug"}
            </p>
            <p className="clamp-1 mt-1 text-lg text-[#1a0dab] dark:text-[#8ab4f8]">
              {previewTitle}
            </p>
            <p className="clamp-2 mt-0.5 text-sm text-body">{previewDescription}</p>
          </div>

          <div className="space-y-4">
            <Field
              label="Meta title"
              htmlFor="metaTitle"
              hint={`${metaTitle.length}/60 — leave blank to use the post title.`}
            >
              <input
                id="metaTitle"
                name="metaTitle"
                value={metaTitle}
                onChange={(event) => setMetaTitle(event.target.value)}
                maxLength={200}
                className={inputClass}
              />
            </Field>

            <Field
              label="Meta description"
              htmlFor="metaDescription"
              hint={`${metaDescription.length}/160 is the sweet spot.`}
            >
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={metaDescription}
                onChange={(event) => setMetaDescription(event.target.value)}
                rows={2}
                maxLength={320}
                className={`${inputClass} resize-y`}
              />
            </Field>

            <Field
              label="Canonical URL"
              htmlFor="canonicalUrl"
              hint="Only set this if the post was first published elsewhere."
            >
              <input
                id="canonicalUrl"
                name="canonicalUrl"
                type="url"
                defaultValue={values.canonicalUrl}
                placeholder="https://"
                className={inputClass}
              />
            </Field>

            <Toggle
              name="noindex"
              label="Hide from search engines"
              hint="Adds noindex — use for thin or duplicated pages."
              defaultChecked={values.noindex}
            />
          </div>
        </Card>
      </div>

      {/* ------------------------------------------------------- Sidebar */}
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
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>

            <Field
              label="Publish date"
              htmlFor="publishedAt"
              hint="Set a future date to schedule the post."
            >
              <input
                id="publishedAt"
                name="publishedAt"
                type="datetime-local"
                defaultValue={toLocalInput(values.publishedAt)}
                className={inputClass}
              />
            </Field>

            <div className="space-y-2">
              <Toggle
                name="featured"
                label="Feature on the homepage"
                defaultChecked={values.featured}
              />
              <Toggle
                name="pinned"
                label="Pin to the top of the feed"
                defaultChecked={values.pinned}
              />
              <Toggle
                name="allowComments"
                label="Allow comments"
                defaultChecked={values.allowComments}
              />
            </div>

            {state.error && (
              <p className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {state.error}
              </p>
            )}

            {(state.message || saved) && !state.error && (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
                <Check size={15} /> {state.message ?? "Saved."}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <SubmitButton icon={<Save size={15} />} className="flex-1">
                Save post
              </SubmitButton>
              {values.id && values.status === "published" && (
                <Link
                  href={`/${effectiveSlug}`}
                  target="_blank"
                  aria-label="View post"
                  className="grid size-11 place-items-center rounded-lg border hairline text-body transition hover:border-brand-500 hover:text-accent"
                >
                  <ExternalLink size={15} />
                </Link>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <ImagePicker name="coverImage" defaultValue={values.coverImage} />
          <Field label="Image caption / alt text" htmlFor="coverAlt" className="mt-3">
            <input
              id="coverAlt"
              name="coverAlt"
              defaultValue={values.coverAlt}
              placeholder="Describe the image"
              className={inputClass}
            />
          </Field>
        </Card>

        <Card>
          <Field label="Category" htmlFor="categoryId">
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={values.categoryId ?? ""}
              className={inputClass}
            >
              <option value="">Uncategorised</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Tags"
            htmlFor="tagList"
            hint="Comma separated. New tags are created automatically."
            className="mt-4"
          >
            <input
              id="tagList"
              name="tagList"
              defaultValue={values.tagList}
              placeholder="AI, Web Development"
              className={inputClass}
            />
          </Field>
        </Card>

        <Card>
          <ImagePicker
            name="ogImage"
            defaultValue={values.ogImage}
            label="Social share image"
          />
          <p className="mt-2 text-xs text-faint">
            Optional. Falls back to the cover image. 1200×630 works best.
          </p>
        </Card>

        {values.id && (
          <SubmitButton
            variant="danger"
            className="w-full"
            icon={<Trash2 size={15} />}
            formAction={deletePost}
            confirm="Delete this post permanently? This cannot be undone."
          >
            Delete post
          </SubmitButton>
        )}
      </div>
    </form>
  );
}
