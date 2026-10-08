import type { Tag } from "@/lib/types";

export function TagChip({ tag }: { tag: Tag }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: `${tag.color}1f`, color: tag.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
      {tag.name}
    </span>
  );
}
