import type { ReactNode } from "react";

/** Shared input styles so every form looks the same. */
export const inputClass =
  "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none transition-colors placeholder:text-fg-subtle focus:border-brand";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-fg-muted">{hint}</span>}
    </label>
  );
}
