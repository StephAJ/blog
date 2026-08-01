import { Pencil, Trash2, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CategoryForm } from "@/components/admin/category-form";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminPageHeader, Card, EmptyState } from "@/components/admin/ui";
import { db } from "@/db";
import { getCategoriesWithCounts } from "@/db/queries";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

import { deleteCategory } from "../../actions/taxonomy";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ edit?: string }> };

export default async function CategoriesPage({ searchParams }: Props) {
  const { edit } = await searchParams;
  const editId = Number(edit);

  const [list, editing] = await Promise.all([
    getCategoriesWithCounts(),
    Number.isInteger(editId) && editId > 0
      ? db.query.categories.findFirst({ where: eq(categories.id, editId) })
      : Promise.resolve(undefined),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Each post belongs to one category. The colour drives badges across the site."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="order-2 lg:order-1">
          {list.length === 0 ? (
            <EmptyState
              title="No categories yet"
              description="Create one on the right to start organising posts."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border hairline surface">
              <table className="w-full min-w-[38rem] text-sm">
                <thead>
                  <tr className="border-b hairline text-left">
                    <th className="eyebrow px-5 py-3 text-faint">Category</th>
                    <th className="eyebrow px-5 py-3 text-faint">URL</th>
                    <th className="eyebrow px-5 py-3 text-right text-faint">Posts</th>
                    <th className="eyebrow px-5 py-3 text-right text-faint">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y hairline">
                  {list.map((category) => (
                    <tr key={category.id} className="transition hover:surface-subtle">
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-2.5 font-semibold">
                          <span
                            className="size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </span>
                        {category.description && (
                          <p className="clamp-1 mt-0.5 text-xs text-faint">
                            {category.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/category/${category.slug}`}
                          target="_blank"
                          className="font-mono text-xs text-faint transition hover:text-accent"
                        >
                          /category/{category.slug}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium">
                        {category.count}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/categories?edit=${category.id}`}
                            aria-label={`Edit ${category.name}`}
                            className="grid size-8 place-items-center rounded-lg border hairline text-body transition hover:border-brand-500 hover:text-accent"
                          >
                            <Pencil size={14} />
                          </Link>
                          <form action={deleteCategory}>
                            <input type="hidden" name="id" value={category.id} />
                            <SubmitButton
                              variant="danger"
                              className="size-8 p-0"
                              confirm={`Delete “${category.name}”? Its posts stay but become uncategorised.`}
                            >
                              <Trash2 size={14} />
                            </SubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="order-1 lg:order-2">
          <Card
            title={editing ? `Edit “${editing.name}”` : "New category"}
            className="lg:sticky lg:top-6"
          >
            {editing && (
              <Link
                href="/admin/categories"
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-faint transition hover:text-accent"
              >
                <X size={13} /> Cancel editing
              </Link>
            )}
            <CategoryForm category={editing} />
          </Card>
        </div>
      </div>
    </>
  );
}
