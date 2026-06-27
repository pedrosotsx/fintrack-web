import type { InputHTMLAttributes } from "react";

import { cn } from "../utils/cn";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, className, ...props }: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-fin-text">{label}</span>
      <input
        className={cn(
          "h-11 w-full rounded-md border border-fin-border bg-zinc-950 px-3 text-sm text-fin-text outline-none transition placeholder:text-zinc-600 focus:border-fin-red",
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-red-300">{error}</span> : null}
    </label>
  );
}
