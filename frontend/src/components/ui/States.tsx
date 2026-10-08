import { Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-fg-muted">
      <Loader2 size={18} className="animate-spin text-brand" />
      {label}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover text-fg-subtle">
        <Icon size={22} />
      </div>
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="m-6 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
      {message}. Is the backend running on {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}?
    </div>
  );
}
