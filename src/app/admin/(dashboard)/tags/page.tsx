import { Plus, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SubmitButton } from "@/components/admin/submit-button";
import { AdminPageHeader, Card, EmptyState, inputClass } from "@/components/admin/ui";
import { getTagsWithCounts } from "@/db/queries";

import { deleteTag, saveTag } from "../../actions/taxonomy";

export const metadata: Metadata = { title: "Tags" };
export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const list = await getTagsWithCounts();

  async function create(formData: FormData) {
    "use server";
    await saveTag({}, formData);
  }

  return (
    <>
      <AdminPageHeader
        title="Tags"
        description="Free-form labels. A post can carry as many as you like."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="order-2 lg:order-1">
          {list.length === 0 ? (
            <EmptyState
              title="No tags yet"
              description="Tags are also created automatically when you type them into a post."
            />
          ) : (
            <ul className="flex flex-wrap gap-2">
              {list.map((tag) => (
                <li
                  key={tag.id}
                  className="flex items-center gap-2 rounded-full border hairline surface py-1.5 pr-1.5 pl-3.5"
                >
                  <Link
                    href={`/tag/${tag.slug}`}
                    target="_blank"
                    className="text-sm font-medium transition hover:text-accent"
                  >
                    {tag.name}
                  </Link>
                  <span className="text-xs text-faint">{tag.count}</span>
                  <form action={deleteTag}>
                    <input type="hidden" name="id" value={tag.id} />
                    <SubmitButton
                      variant="ghost"
                      className="size-6 rounded-full p-0 hover:bg-red-500 hover:text-white"
                      confirm={`Delete the tag “${tag.name}”?`}
                    >
                      <Trash2 size={12} />
                    </SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="order-1 lg:order-2">
          <Card title="New tag" className="lg:sticky lg:top-6">
            <form action={create} className="space-y-3">
              <label htmlFor="tag-name" className="sr-only">
                Tag name
              </label>
              <input
                id="tag-name"
                name="name"
                required
                maxLength={50}
                placeholder="e.g. Machine Learning"
                className={inputClass}
              />
              <SubmitButton className="w-full" icon={<Plus size={15} />}>
                Add tag
              </SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
