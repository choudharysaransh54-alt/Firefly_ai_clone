"use client";

import { Bot } from "lucide-react";
import { Button } from "../ui/Button";
import { ComingSoonBadge } from "../ui/ComingSoon";
import { Field, inputClass } from "../ui/Field";
import { Modal } from "../ui/Modal";

/** Placeholder for the real-time notetaker bot that joins live calls (out of scope). */
export function CaptureModal({ open, onClose, onUpload }: { open: boolean; onClose: () => void; onUpload: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Fred to a live meeting"
      description="Fred joins your Zoom, Google Meet or Teams call and takes notes for you."
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              onClose();
              onUpload();
            }}
          >
            Upload a transcript instead
          </Button>
          <Button disabled>Invite Fred</Button>
        </>
      }
    >
      <div className="mb-5 flex items-center gap-3 rounded-xl bg-brand-soft p-3 text-sm text-brand-text">
        <Bot size={20} className="shrink-0" />
        <span className="flex-1">The real-time meeting bot is not part of this demo.</span>
        <ComingSoonBadge />
      </div>
      <div className="space-y-4">
        <Field label="Meeting link">
          <input disabled className={inputClass} placeholder="https://meet.google.com/abc-defg-hij" />
        </Field>
        <Field label="Meeting title (optional)">
          <input disabled className={inputClass} placeholder="Weekly sync" />
        </Field>
      </div>
    </Modal>
  );
}
