"use client";

import { X } from "lucide-react";
import { useId, useState, type KeyboardEvent } from "react";

interface ChipInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

/** Type a value and press Enter or comma to add it as a chip (used for participants and tags). */
export function ChipInput({ values, onChange, placeholder, suggestions = [] }: ChipInputProps) {
  const [draft, setDraft] = useState("");
  const listId = useId();

  function add(raw: string) {
    const value = raw.trim().replace(/,$/, "");
    if (value && !values.some((v) => v.toLowerCase() === value.toLowerCase())) onChange([...values, value]);
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1.5 focus-within:border-brand">
      {values.map((value) => (
        <span key={value} className="inline-flex items-center gap-1 rounded-md bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-text">
          {value}
          <button type="button" aria-label={`Remove ${value}`} onClick={() => onChange(values.filter((v) => v !== value))}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        list={listId}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft && add(draft)}
        placeholder={values.length ? "" : placeholder}
        className="min-w-32 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-fg-subtle"
      />
      <datalist id={listId}>
        {suggestions.filter((s) => !values.includes(s)).map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}
