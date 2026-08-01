"use client";

import { ImagePlus, LibraryBig, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { MediaPicker } from "./media-picker";
import { inputClass } from "./ui";

export function ImagePicker({
  name,
  defaultValue = "",
  label = "Cover image",
}: {
  name: string;
  defaultValue?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setUrl(data.url);
    } catch {
      setError("Upload failed. Check your connection.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold">{label}</p>

      {url ? (
        <div className="group relative overflow-hidden rounded-lg border hairline">
          {/* Plain <img>: this is a preview of a file that may have been
              written to disk seconds ago, so it must not depend on the
              image optimizer having caught up. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="aspect-16/9 w-full bg-[var(--surface-subtle)] object-cover"
            onError={() => setError("That image could not be loaded.")}
          />
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setError("");
            }}
            aria-label="Remove image"
            className="absolute top-2 right-2 grid size-8 place-items-center rounded-lg bg-ink-950/70 text-white transition hover:bg-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <div className="grid aspect-16/9 w-full place-items-center rounded-lg border border-dashed hairline">
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin text-faint" />
                <span className="text-sm text-faint">Uploading…</span>
              </>
            ) : (
              <>
                <ImagePlus size={20} className="text-faint" />
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="rounded-lg border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-brand-500 hover:text-accent"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setLibraryOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-brand-500 hover:text-accent"
                  >
                    <LibraryBig size={13} /> Media library
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {url && (
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent transition hover:underline"
        >
          <LibraryBig size={13} /> Choose a different image
        </button>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          event.target.value = "";
        }}
      />

      <input
        name={name}
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="…or paste an image URL"
        className={`${inputClass} mt-2 text-xs`}
      />

      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}

      <MediaPicker
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(selected) => {
          setUrl(selected);
          setError("");
        }}
      />
    </div>
  );
}
