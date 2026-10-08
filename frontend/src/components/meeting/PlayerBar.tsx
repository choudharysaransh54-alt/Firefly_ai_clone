"use client";

import { Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import type { Player } from "@/hooks/usePlayer";
import { colorForName, formatTimestamp } from "@/lib/format";
import type { Segment } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { IconButton } from "../ui/Button";

interface VoiceControl {
  enabled: boolean;
  supported: boolean;
  onToggle: () => void;
}

interface PlayerBarProps {
  player: Player;
  segments: Segment[];
  activeSpeaker: string | null;
  voice: VoiceControl;
}

/** Bottom media bar: play/pause, ±15s, a seek bar showing who spoke when, speed and voice on/off. */
export function PlayerBar({ player, segments, activeSpeaker, voice }: PlayerBarProps) {
  const { currentTime, duration, isPlaying } = player;
  const percent = (seconds: number) => `${(seconds / Math.max(duration, 1)) * 100}%`;
  const voiceOn = voice.enabled && voice.supported;
  const status = !isPlaying ? "Paused" : voiceOn ? "Reading aloud" : "Playing · muted";
  const voiceTitle = !voice.supported
    ? "This browser can't read text aloud — playback is silent"
    : voice.enabled
      ? "Mute voice (the transcript is read aloud by your browser — no recording was uploaded)"
      : "Read the transcript aloud";

  return (
    <div className="shrink-0 border-t border-line bg-surface px-4 py-3 md:px-6">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden w-44 items-center gap-2 md:flex">
          {activeSpeaker && (
            <>
              <Avatar name={activeSpeaker} size="sm" />
              <div className="min-w-0">
                <p className="text-[11px] text-fg-subtle">{status}</p>
                <p className="truncate text-sm font-medium">{activeSpeaker}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <IconButton aria-label="Back 15 seconds" title="Back 15s (←)" onClick={() => player.skip(-15)}>
            <RotateCcw size={17} />
          </IconButton>
          <button
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
            title="Play / pause (Space)"
            onClick={player.togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-md transition-colors hover:bg-brand-hover"
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
          <IconButton aria-label="Forward 15 seconds" title="Forward 15s (→)" onClick={() => player.skip(15)}>
            <RotateCw size={17} />
          </IconButton>
        </div>

        <span className="w-11 text-right text-xs tabular-nums text-fg-muted">{formatTimestamp(currentTime)}</span>

        {/* Seek bar: colored speaker timeline underneath, a transparent range input on top. */}
        <div className="relative h-6 flex-1">
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-surface-hover">
            {segments.map((segment) => (
              <div
                key={segment.id}
                className="absolute inset-y-0 opacity-40"
                style={{
                  left: percent(segment.start_time),
                  width: percent(segment.end_time - segment.start_time),
                  backgroundColor: colorForName(segment.speaker),
                }}
              />
            ))}
            <div className="absolute inset-y-0 left-0 bg-brand/70" style={{ width: percent(currentTime) }} />
          </div>
          <input
            type="range"
            aria-label="Seek"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={(event) => player.seek(Number(event.target.value))}
            className="seek-range absolute inset-x-0 top-1/2 h-3.5 w-full -translate-y-1/2"
          />
        </div>

        <span className="w-11 text-xs tabular-nums text-fg-muted">{formatTimestamp(duration)}</span>
        <button
          type="button"
          onClick={player.cycleSpeed}
          title="Playback speed"
          className="w-12 rounded-md border border-line py-1 text-xs font-semibold text-fg-muted hover:bg-surface-hover hover:text-fg"
        >
          {player.speed}x
        </button>
        <IconButton
          aria-label={voiceOn ? "Mute voice" : "Unmute voice"}
          title={voiceTitle}
          onClick={voice.onToggle}
          disabled={!voice.supported}
          className={voiceOn ? "text-brand" : ""}
        >
          {voiceOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </IconButton>
      </div>
    </div>
  );
}
