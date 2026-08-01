"use client";

import { Check, Copy, Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function MediaUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function upload(files: FileList) {
    setUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? `Could not upload ${file.name}.`);
      }
    }

    setUploading(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
        {uploading ? "Uploading…" : "Upload images"}
      </button>

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) upload(event.target.files);
          event.target.value = "";
        }}
      />

      {error && (
        <p className="mt-2 w-full text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </>
  );
}

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      aria-label="Copy image URL"
      className="grid size-8 place-items-center rounded-lg bg-ink-950/70 text-white transition hover:bg-brand-600"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}
