import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-lg border hairline surface px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 disabled:opacity-60";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-body">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  children,
  className,
  footer,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-xl border hairline surface", className)}>
      {(title || description) && (
        <header className="border-b hairline px-5 py-4">
          {title && <h2 className="font-bold">{title}</h2>}
          {description && <p className="mt-1 text-sm text-body">{description}</p>}
        </header>
      )}
      <div className="p-5">{children}</div>
      {footer && <footer className="border-t hairline px-5 py-4">{footer}</footer>}
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
    </div>
  );
}

export function Toggle({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border hairline p-3.5 transition hover:surface-subtle">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand-600)]"
      />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-faint">{hint}</span>}
      </span>
    </label>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    published: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    draft: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    approved: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    pending: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    spam: "bg-red-500/12 text-red-600 dark:text-red-400",
  };

  return (
    <span
      className={cn(
        "eyebrow inline-flex rounded-full px-2.5 py-1",
        tone[status] ?? "surface-subtle text-faint",
      )}
    >
      {status}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed hairline px-6 py-16 text-center">
      <p className="font-semibold">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm text-body">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
