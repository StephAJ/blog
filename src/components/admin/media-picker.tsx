"use client";

import { Check, ImageOff, Loader2, Search, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { inputClass } from "./ui";

type MediaItem = {
  id: number;
  url: string;
  filename: string;
  width: number | null;
  height: number | null;
  alt: string | null;
};

export function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/media");
      if (!response.ok) throw new Error("Could not load the media library.");
      const data = await response.json();
      setItems(data.items ?? []);
    } catch {
      setError("Could not load the media library.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function upload(files: FileList) {
    setUploading(true);
    setError("");
    let lastUrl = "";

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? `Could not upload ${file.name}.`);
      } else {
        lastUrl = data.url;
      }
    }

    setUploading(false);
    await load();
    if (lastUrl) onSelect(lastUrl);
  }

  if (!open) return null;

  const filtered = query.trim()
    ? items.filter((item) =>
        item.filename.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : items;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Media library"
        className="flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border hairline surface shadow-lift"
      >
        <header className="flex items-center gap-3 border-b hairline px-5 py-3.5">
          <h2 className="font-bold">Media library</h2>
          <div className="relative ml-auto">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by filename…"
              aria-label="Filter media"
              className={cn(inputClass, "w-52 pl-9")}
            />
          </div>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Upload size={15} />
            )}
            Upload
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-lg border hairline text-body transition hover:border-brand-500 hover:text-accent"
          >
            <X size={16} />
          </button>
        </header>

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) upload(event.target.files);
            event.target.value = "";
          }}
        />

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="flex items-center justify-center gap-2 py-16 text-sm text-faint">
              <Loader2 size={16} className="animate-spin" /> Loading…
            </p>
          ) : error ? (
            <p className="py-16 text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <ImageOff size={28} className="mx-auto text-faint" />
              <p className="mt-3 text-sm font-semibold">
                {items.length === 0 ? "Nothing in the library yet" : "No matches"}
              </p>
              <p className="mt-1 text-sm text-body">
                {items.length === 0
                  ? "Upload an image to get started."
                  : "Try a different filename."}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item.url);
                      onClose();
                    }}
                    className="group block w-full overflow-hidden rounded-lg border hairline text-left transition hover:border-brand-500"
                  >
                    <span className="relative block aspect-4/3 surface-subtle">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.alt ?? item.filename}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                      <span className="absolute inset-0 grid place-items-center bg-brand-600/0 opacity-0 transition group-hover:bg-brand-600/70 group-hover:opacity-100">
                        <Check size={22} className="text-white" />
                      </span>
                    </span>
                    <span className="block truncate px-2.5 py-2 font-mono text-xs text-faint">
                      {item.filename}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
