"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Segment } from "@/lib/types";

/** Natural text-to-speech pace at rate 1 (≈160 words per minute). */
const WORDS_PER_SECOND = 2.7;
/** Small pitch differences so speakers sound different even if the browser has few voices. */
const PITCHES = [1, 0.88, 1.12, 0.95, 1.05];
/** Natural-sounding voices (macOS, Chrome, Windows/Edge), tried first in this order when installed. */
const PREFERRED_VOICES = [
  "Samantha", "Daniel", "Karen", "Moira", "Tessa", "Rishi",
  "Google US English", "Google UK English Female", "Google UK English Male",
  "Microsoft Aria", "Microsoft Jenny", "Microsoft Guy", "Microsoft Zira", "Microsoft David",
];
/** macOS also ships joke voices ("Bubbles", "Zarvox"...) and very robotic old ones — never use them. */
const EXCLUDED_VOICES = [
  "Albert", "Bad News", "Bahh", "Bells", "Boing", "Bubbles", "Cellos", "Deranged", "Fred", "Good News", "Grandma",
  "Grandpa", "Hysterical", "Jester", "Junior", "Kathy", "Organ", "Pipe Organ", "Ralph", "Superstar", "Trinoids",
  "Whisper", "Wobble", "Zarvox",
];

interface SpeechPlaybackOptions {
  segments: Segment[];
  activeIndex: number;
  isPlaying: boolean;
  speed: number;
  seekCount: number;
  getCurrentTime: () => number;
  enabled: boolean;
}

/**
 * There is no recording behind a transcript, so "Play" makes sound by reading the transcript aloud
 * with the browser's built-in text-to-speech (Web Speech API) — no API key or audio files needed.
 * It follows the virtual player: the active line is spoken in that speaker's voice, and pausing,
 * seeking, changing speed or switching lines restarts speech at the right place.
 */
export function useSpeechPlayback(options: SpeechPlaybackOptions): { supported: boolean } {
  const { segments, activeIndex, isPlaying, speed, seekCount, getCurrentTime, enabled } = options;
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  // Speaker order of first appearance -> each speaker always gets the same voice.
  const speakers = useMemo(() => [...new Set(segments.map((s) => s.speaker))], [segments]);

  // Browsers load their voice list asynchronously, so listen for updates.
  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      voicesRef.current = pickVoices(synth.getVoices());
    };
    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);
    return () => synth.removeEventListener("voiceschanged", loadVoices);
  }, [supported]);

  // Speak the active line whenever playback starts, the line changes, or the user seeks.
  useEffect(() => {
    if (!supported || !enabled || !isPlaying || activeIndex < 0) return;
    const synth = window.speechSynthesis;
    // A short delay means dragging the seek bar only speaks once, at the final position.
    const timer = window.setTimeout(() => {
      const segment = segments[activeIndex];
      const now = getCurrentTime();
      const words = unspokenWords(segment, now);
      if (!words.length) return;

      // Speed up a little if needed so the line fits before the next one starts.
      const secondsLeft = Math.max(segment.end_time - Math.max(now, segment.start_time), 0.5) / speed;
      const rate = Math.min(Math.max(words.length / WORDS_PER_SECOND / secondsLeft, 0.9), 2);
      const speakerIndex = Math.max(speakers.indexOf(segment.speaker), 0);
      const voices = voicesRef.current;

      synth.cancel();
      synth.resume(); // Chrome can get stuck in a paused state; this un-sticks it
      // One utterance per sentence: Chrome cuts off single utterances longer than ~15 seconds.
      for (const sentence of splitSentences(words.join(" "))) {
        const utterance = new SpeechSynthesisUtterance(sentence);
        if (voices.length) utterance.voice = voices[speakerIndex % voices.length];
        utterance.lang = utterance.voice?.lang ?? "en-US";
        utterance.rate = rate;
        utterance.pitch = PITCHES[speakerIndex % PITCHES.length];
        synth.speak(utterance);
      }
    }, 80);

    // Runs on pause, seek, line change, mute and unmount: stop whatever is being said.
    return () => {
      window.clearTimeout(timer);
      synth.cancel();
    };
  }, [supported, enabled, isPlaying, activeIndex, seekCount, speed, segments, speakers, getCurrentTime]);

  return { supported };
}

/** If playback starts in the middle of a line, skip the words that were "already said". */
function unspokenWords(segment: Segment, now: number): string[] {
  const words = segment.text.split(/\s+/).filter(Boolean);
  const progress = (now - segment.start_time) / Math.max(segment.end_time - segment.start_time, 0.5);
  return progress > 0.15 ? words.slice(Math.floor(words.length * Math.min(progress, 1))) : words;
}

function splitSentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
}

/** English voices only (one per voice name): preferred natural voices first, then on-device, then online. */
function pickVoices(all: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const seen = new Set<string>();
  const english = all.filter((voice) => {
    const baseName = voice.name.split(" (")[0];
    if (!voice.lang.toLowerCase().startsWith("en") || seen.has(baseName)) return false;
    if (EXCLUDED_VOICES.some((name) => baseName === name || baseName.startsWith(`${name} `))) return false;
    seen.add(baseName);
    return true;
  });
  const rank = (voice: SpeechSynthesisVoice) => {
    const preferred = PREFERRED_VOICES.findIndex((name) => voice.name.startsWith(name));
    return preferred >= 0 ? preferred : PREFERRED_VOICES.length + (voice.localService ? 0 : 1);
  };
  const ordered = [...english].sort((a, b) => rank(a) - rank(b)); // stable sort: browser order on ties
  return ordered.length ? ordered : all;
}
