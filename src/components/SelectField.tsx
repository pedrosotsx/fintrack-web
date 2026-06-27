import type { SelectHTMLAttributes } from "react";

import { cn } from "../utils/cn";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export function SelectField({ label, error, className, children, ...props }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-fin-text">{label}</span>
      <select
        className={cn(
          "h-11 w-full rounded-md border border-fin-border bg-zinc-950 px-3 text-sm text-fin-text outline-none transition focus:border-fin-red disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="mt-2 block text-sm text-red-300">{error}</span> : null}
    </label>
  );
}
