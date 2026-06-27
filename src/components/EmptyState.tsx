import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-fin-border bg-zinc-950/40 p-8 text-center">
      <p className="max-w-sm text-sm text-fin-muted">{title}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
