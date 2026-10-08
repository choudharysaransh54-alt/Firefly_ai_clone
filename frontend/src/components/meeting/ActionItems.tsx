"use client";

import { CheckCircle2, Circle, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { formatTimestamp } from "@/lib/format";
import type { ActionItem } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";

type ItemsChange = (change: (items: ActionItem[]) => ActionItem[]) => void;

interface ActionItemsProps {
  meetingId: number;
  items: ActionItem[];
  people: string[];
  onSeek: (time: number) => void;
  onItemsChange: ItemsChange;
}

const UNASSIGNED = "Unassigned";

/** Action items grouped by owner, with add / edit / complete / delete. */
export function ActionItems({ meetingId, items, people, onSeek, onItemsChange }: ActionItemsProps) {
  const toast = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const replace = (item: ActionItem) => onItemsChange((list) => list.map((i) => (i.id === item.id ? item : i)));

  async function run(action: () => Promise<void>, successMessage?: string) {
    try {
      await action();
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function toggle(item: ActionItem) {
    replace({ ...item, is_completed: !item.is_completed }); // optimistic: update the UI first
    try {
      replace(await api.updateActionItem(item.id, { is_completed: !item.is_completed }));
    } catch (error) {
      replace(item); // roll back
      toast.error((error as Error).message);
    }
  }

  const save = (item: ActionItem, text: string, assignee: string | null) =>
    run(async () => {
      replace(await api.updateActionItem(item.id, { text, assignee }));
      setEditingId(null);
    }, "Action item updated");

  const remove = (item: ActionItem) =>
    run(async () => {
      await api.deleteActionItem(item.id);
      onItemsChange((list) => list.filter((i) => i.id !== item.id));
    }, "Action item deleted");

  const add = (text: string, assignee: string | null) =>
    run(async () => {
      const created = await api.createActionItem(meetingId, { text, assignee });
      onItemsChange((list) => [...list, created]);
      setAdding(false);
    }, "Action item added");

  // Group by owner, keeping the original order inside each group.
  const groups = new Map<string, ActionItem[]>();
  for (const item of items) {
    const owner = item.assignee ?? UNASSIGNED;
    groups.set(owner, [...(groups.get(owner) ?? []), item]);
  }
  const doneCount = items.filter((i) => i.is_completed).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-fg-muted">
          {doneCount} of {items.length} completed
        </span>
      </div>

      {items.length === 0 && !adding && <p className="mb-3 text-sm text-fg-muted">No action items yet.</p>}

      <div className="space-y-4">
        {[...groups.entries()].map(([owner, list]) => (
          <div key={owner}>
            <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-fg-muted">
              {owner !== UNASSIGNED && <Avatar name={owner} size="xs" />}
              {owner}
            </p>
            <ul className="space-y-0.5">
              {list.map((item) =>
                editingId === item.id ? (
                  <li key={item.id}>
                    <ActionItemForm
                      people={people}
                      initialText={item.text}
                      initialAssignee={item.assignee}
                      submitLabel="Save"
                      onSubmit={(text, assignee) => save(item, text, assignee)}
                      onCancel={() => setEditingId(null)}
                    />
                  </li>
                ) : (
                  <li key={item.id} className="group flex items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-hover">
                    <button
                      type="button"
                      aria-label={item.is_completed ? "Mark as not done" : "Mark as done"}
                      onClick={() => toggle(item)}
                      className="mt-0.5 shrink-0 text-fg-subtle hover:text-brand"
                    >
                      {item.is_completed ? <CheckCircle2 size={17} className="text-success" /> : <Circle size={17} />}
                    </button>
                    <span className={`flex-1 text-sm ${item.is_completed ? "text-fg-subtle line-through" : ""}`}>{item.text}</span>
                    {item.timestamp !== null && (
                      <button
                        type="button"
                        onClick={() => onSeek(item.timestamp!)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand-soft px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-brand-text"
                      >
                        <Play size={9} fill="currentColor" /> {formatTimestamp(item.timestamp)}
                      </button>
                    )}
                    <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button type="button" aria-label="Edit action item" onClick={() => setEditingId(item.id)} className="p-0.5 text-fg-subtle hover:text-fg">
                        <Pencil size={14} />
                      </button>
                      <button type="button" aria-label="Delete action item" onClick={() => remove(item)} className="p-0.5 text-fg-subtle hover:text-danger">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-3">
        {adding ? (
          <ActionItemForm people={people} submitLabel="Add" onSubmit={add} onCancel={() => setAdding(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-brand hover:bg-brand-soft"
          >
            <Plus size={15} /> Add action item
          </button>
        )}
      </div>
    </div>
  );
}

function ActionItemForm({
  people,
  initialText = "",
  initialAssignee = null,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  people: string[];
  initialText?: string;
  initialAssignee?: string | null;
  submitLabel: string;
  onSubmit: (text: string, assignee: string | null) => Promise<void>;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initialText);
  const [assignee, setAssignee] = useState(initialAssignee ?? "");
  // Keep the current owner selectable even if they're no longer a listed participant.
  const options = assignee && !people.includes(assignee) ? [assignee, ...people] : people;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (text.trim()) onSubmit(text.trim(), assignee || null);
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface p-2">
      <input
        autoFocus
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => event.key === "Escape" && onCancel()}
        placeholder="What needs to be done?"
        className="h-8 min-w-48 flex-1 rounded-md bg-transparent px-2 text-sm outline-none placeholder:text-fg-subtle"
      />
      <select
        aria-label="Assignee"
        value={assignee}
        onChange={(event) => setAssignee(event.target.value)}
        className="h-8 rounded-md border border-line bg-surface px-2 text-xs outline-none"
      >
        <option value="">{UNASSIGNED}</option>
        {options.map((person) => (
          <option key={person} value={person}>
            {person}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={!text.trim()}>
        {submitLabel}
      </Button>
      <Button variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
}
