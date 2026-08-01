"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SearchButton() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "/" && !open) {
        const target = event.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const term = value.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search posts"
        className="grid size-9 place-items-center rounded-full border hairline text-body transition hover:border-brand-500 hover:text-accent"
      >
        <Search size={16} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-100 flex items-start justify-center bg-ink-950/40 px-4 pt-[18vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <form
            onSubmit={submit}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border hairline surface shadow-lift"
            role="search"
          >
            <div className="flex items-center gap-3 px-5">
              <Search size={20} className="shrink-0 text-faint" />
              <input
                ref={inputRef}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Search articles…"
                aria-label="Search articles"
                className="w-full bg-transparent py-5 text-lg outline-none placeholder:text-[var(--text-muted)]"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="shrink-0 text-faint transition hover:text-accent"
              >
                <X size={20} />
              </button>
            </div>
            <div className="border-t hairline surface-subtle px-5 py-3 text-xs text-faint">
              Press <kbd className="rounded border hairline surface px-1.5 py-0.5 font-mono">Enter</kbd> to
              search · <kbd className="rounded border hairline surface px-1.5 py-0.5 font-mono">Esc</kbd> to close
            </div>
          </form>
        </div>
      )}
    </>
  );
}
