import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  children: ReactNode;
}

export function Panel({ title, children }: PanelProps) {
  return (
    <section className="rounded-lg border border-fin-border bg-fin-panel p-4 sm:p-5">
      {title ? <h2 className="mb-5 text-base font-semibold text-fin-text">{title}</h2> : null}
      {children}
    </section>
  );
}
