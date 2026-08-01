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
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  icon?: React.ReactNode;
  name?: string;
  value?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  confirm?: string;
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
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60",
        variants[variant],
        className,
      )}
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
