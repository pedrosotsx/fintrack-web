import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  tone?: "default" | "success" | "danger";
}

const toneClasses = {
  default: "text-fin-text",
  success: "text-fin-success",
  danger: "text-red-300",
};

export function MetricCard({ title, value, icon, tone = "default" }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-fin-border bg-fin-panel p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-fin-muted">{title}</p>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-fin-border bg-zinc-950 text-fin-muted sm:h-10 sm:w-10">
          {icon}
        </div>
      </div>
      <p className={`mt-5 break-words text-xl font-bold sm:text-2xl ${toneClasses[tone]}`}>
        {value}
      </p>
    </article>
  );
}
