import { RefreshCcw } from "lucide-react";

import { Button } from "./Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-900/70 bg-red-950/20 p-5">
      <p className="text-sm font-medium text-red-200">{message}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="danger"
          size="sm"
          className="mt-4"
          icon={<RefreshCcw className="h-4 w-4" />}
          onClick={onRetry}
        >
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
