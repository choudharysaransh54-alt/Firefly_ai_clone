"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 2];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * A "virtual" media player. There is no recording, so playback is a clock that moves forward
 * while playing (the sound comes from useSpeechPlayback reading the transcript aloud).
 * It exposes what an <audio> element would (currentTime, play/pause, seek, speed), so swapping
 * in a real media file later only means changing this hook.
 */
export function usePlayer(duration: number, initialTime = 0) {
  const [currentTime, setCurrentTime] = useState(() => clamp(initialTime, 0, duration));
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  // Bumped on every manual seek, so listeners (e.g. speech) know to restart at the new position.
  const [seekCount, setSeekCount] = useState(0);
  // The interval callback reads the latest time from a ref instead of a stale closure.
  const timeRef = useRef(currentTime);

  useEffect(() => {
    if (!isPlaying) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const next = Math.min(timeRef.current + ((now - last) / 1000) * speed, duration);
      last = now;
      timeRef.current = next;
      setCurrentTime(next);
      if (next >= duration) setIsPlaying(false);
    }, 100);
    return () => window.clearInterval(timer);
  }, [isPlaying, speed, duration]);

  const seek = useCallback(
    (time: number) => {
      const next = clamp(time, 0, duration);
      timeRef.current = next;
      setCurrentTime(next);
      setSeekCount((count) => count + 1);
    },
    [duration],
  );

  /** Latest time without causing a re-render (for code that runs outside React rendering). */
  const getCurrentTime = useCallback(() => timeRef.current, []);

  const play = useCallback(() => setIsPlaying(true), []);

  const togglePlay = useCallback(() => {
    if (timeRef.current >= duration) seek(0); // finished: replay from the start
    setIsPlaying((playing) => !playing);
  }, [duration, seek]);

  const skip = useCallback((seconds: number) => seek(timeRef.current + seconds), [seek]);

  const cycleSpeed = useCallback(
    () => setSpeed((current) => PLAYBACK_SPEEDS[(PLAYBACK_SPEEDS.indexOf(current) + 1) % PLAYBACK_SPEEDS.length]),
    [],
  );

  return { currentTime, duration, isPlaying, speed, seekCount, getCurrentTime, seek, play, togglePlay, skip, cycleSpeed };
}

export type Player = ReturnType<typeof usePlayer>;
