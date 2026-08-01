import { Trash2 } from "lucide-react";
import type { Metadata } from "next";

import { CopyUrlButton, MediaUploader } from "@/components/admin/media-uploader";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminPageHeader, EmptyState } from "@/components/admin/ui";
import { getMediaLibrary } from "@/db/queries";
import { formatDate } from "@/lib/utils";

import { deleteMedia } from "../../actions/settings";

export const metadata: Metadata = { title: "Media" };
export const dynamic = "force-dynamic";

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function MediaPage() {
  const items = await getMediaLibrary();

  return (
    <>
      <AdminPageHeader
        title="Media"
        description="Uploads are converted to WebP and capped at 1920px wide."
        actions={<MediaUploader />}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No uploads yet"
          description="Images you add from the post editor also land here."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="group overflow-hidden rounded-xl border hairline surface"
            >
              <div className="relative aspect-4/3 surface-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt ?? item.filename}
                  loading="lazy"
                  className="size-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                  <CopyUrlButton url={item.url} />
                  <form action={deleteMedia}>
                    <input type="hidden" name="id" value={item.id} />
                    <SubmitButton
                      variant="ghost"
                      className="size-8 rounded-lg bg-ink-950/70 p-0 text-white hover:bg-red-600 hover:text-white"
                      confirm="Remove this image from the library? The file stays on disk."
                    >
                      <Trash2 size={14} />
                    </SubmitButton>
                  </form>
                </div>
              </div>

              <div className="p-3">
                <p className="clamp-1 font-mono text-xs" title={item.filename}>
                  {item.filename}
                </p>
                <p className="mt-1 text-xs text-faint">
                  {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                  {fileSize(item.size)} · {formatDate(item.createdAt, "short")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
