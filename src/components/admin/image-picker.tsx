"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

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
  const fileInput = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="aspect-16/9 w-full object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            aria-label="Remove image"
            className="absolute top-2 right-2 grid size-8 place-items-center rounded-lg bg-ink-950/70 text-white transition hover:bg-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="flex aspect-16/9 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed hairline text-sm text-faint transition hover:border-brand-500 hover:text-accent"
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <ImagePlus size={20} />
          )}
          {uploading ? "Uploading…" : "Upload an image"}
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
    </div>
  );
}
