/** Wraps every case-insensitive occurrence of `query` inside `text` in a <mark>. */
export function Highlight({ text, query, active = false }: { text: string; query: string; active?: boolean }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Splitting on a *capturing* group keeps the matches: they land at the odd indexes.
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark
            key={index}
            className={`rounded px-0.5 text-fg ${active ? "bg-orange-300 dark:bg-orange-500/70" : "bg-highlight"}`}
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
