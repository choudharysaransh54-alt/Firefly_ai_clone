import type { LucideIcon } from "lucide-react";

export function ComingSoonBadge() {
  return (
    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-text">
      Coming soon
    </span>
  );
}

/** Placeholder for features that are intentionally out of scope (bot, integrations, teams...). */
export function ComingSoon({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Icon size={26} />
      </div>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <ComingSoonBadge />
      </div>
      <p className="max-w-md text-sm text-fg-muted">{description}</p>
    </div>
  );
}
