"use client";

import { AlertCircle, Check, Save } from "lucide-react";
import { useState } from "react";
import { useActionState } from "react";

import { saveCategory } from "@/app/admin/actions/taxonomy";
import type { ActionState } from "@/app/admin/actions/posts";
import type { Category } from "@/db/schema";
import { slugify } from "@/lib/utils";

import { SubmitButton } from "./submit-button";
import { Field, inputClass } from "./ui";

const PRESETS = [
  "#d9482b", "#2563eb", "#0f766e", "#7c3aed",
  "#db2777", "#16a34a", "#ea580c", "#0891b2", "#9333ea",
];

export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveCategory, {});
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [color, setColor] = useState(category?.color ?? "#d9482b");

  return (
    <form action={formAction} className="space-y-4" key={category?.id ?? "new"}>
      {category && <input type="hidden" name="id" value={category.id} />}

      <Field label="Name" htmlFor="name" required>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (!category) setSlug(slugify(event.target.value));
          }}
          required
          className={inputClass}
        />
      </Field>

      <Field label="URL slug" htmlFor="slug" hint={`/category/${slug || "…"}`}>
        <input
          id="slug"
          name="slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className={`${inputClass} font-mono text-xs`}
        />
      </Field>

      <Field label="Description" htmlFor="description" hint="Used on the category page and in search results.">
        <textarea
          id="description"
          name="description"
          defaultValue={category?.description ?? ""}
          rows={2}
          maxLength={300}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div>
        <p className="mb-1.5 text-xs font-semibold">Colour</p>
        <div className="flex items-center gap-2">
          <input
            type="color"
            name="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            aria-label="Category colour"
            className="size-10 shrink-0 cursor-pointer rounded-lg border hairline bg-transparent"
          />
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                aria-label={`Use ${preset}`}
                style={{ backgroundColor: preset }}
                className="size-6 rounded-full ring-offset-2 ring-offset-[var(--surface-card)] transition hover:scale-110 data-[active=true]:ring-2"
                data-active={color.toLowerCase() === preset}
              />
            ))}
          </div>
        </div>
      </div>

      <Field label="Order" htmlFor="position" hint="Lower numbers appear first in the menu.">
        <input
          id="position"
          name="position"
          type="number"
          min={0}
          max={999}
          defaultValue={category?.position ?? 0}
          className={inputClass}
        />
      </Field>

      {state.error && (
        <p className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={15} className="mt-0.5 shrink-0" /> {state.error}
        </p>
      )}
      {state.message && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          <Check size={15} /> {state.message}
        </p>
      )}

      <SubmitButton className="w-full" icon={<Save size={15} />}>
        {category ? "Update category" : "Create category"}
      </SubmitButton>
    </form>
  );
}
