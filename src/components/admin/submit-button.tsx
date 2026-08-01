"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  variant = "primary",
  className,
  icon,
  name,
  value,
  formAction,
  confirm,
  iconOnly = false,
  title,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  icon?: React.ReactNode;
  name?: string;
  value?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  confirm?: string;
  /**
   * Square button holding just an icon. This has to be a prop rather than a
   * `p-0` in `className`, because Tailwind emits `.px-4` after `.p-0` and the
   * later rule wins — which silently squeezed the icon to zero width.
   */
  iconOnly?: boolean;
  title?: string;
}) {
  const { pending } = useFormStatus();

  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "border hairline hover:border-brand-500 hover:text-accent",
    danger:
      "border border-red-500/40 text-red-600 hover:bg-red-500 hover:text-white dark:text-red-400",
    ghost: "text-body hover:text-accent",
  };

  return (
    <button
      type="submit"
      name={name}
      value={value}
      formAction={formAction}
      disabled={pending}
      onClick={
        confirm
          ? (event) => {
              if (!window.confirm(confirm)) event.preventDefault();
            }
          : undefined
      }
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition disabled:opacity-60",
        iconOnly ? "size-9" : "px-4 py-2.5",
        variants[variant],
        className,
      )}
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
