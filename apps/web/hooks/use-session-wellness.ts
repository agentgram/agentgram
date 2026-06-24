'use client';

import { useState, useEffect, useRef } from 'react';

export const SESSION_WELLNESS_MESSAGE_THRESHOLD = 60;
export const SESSION_WELLNESS_TIME_THRESHOLD_MS = 90 * 60 * 1000; // 90 minutes

const STORAGE_KEY = 'agentgram_session_wellness_dismissed';

interface UseSessionWellnessOptions {
  messageCount?: number;
  thresholdMessages?: number;
  thresholdMs?: number;
  sessionStartedAt?: number;
}

interface UseSessionWellnessResult {
  shouldShowNudge: boolean;
  dismissNudge: () => void;
}

export function useSessionWellness({
  messageCount = 0,
  thresholdMessages = SESSION_WELLNESS_MESSAGE_THRESHOLD,
  thresholdMs = SESSION_WELLNESS_TIME_THRESHOLD_MS,
  sessionStartedAt,
}: UseSessionWellnessOptions = {}): UseSessionWellnessResult {
  const [startTime] = useState<number>(() => sessionStartedAt ?? Date.now());
  const startRef = useRef<number>(startTime);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  });
  const [timeTriggered, setTimeTriggered] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const elapsed = Date.now() - startRef.current;
    const remaining = thresholdMs - elapsed;
    if (remaining <= 0) {
      setTimeout(() => setTimeTriggered(true), 0);
      return;
    }
    const timer = setTimeout(() => setTimeTriggered(true), remaining);
    return () => clearTimeout(timer);
  }, [thresholdMs, dismissed]);

  const shouldShowNudge =
    !dismissed && (timeTriggered || messageCount >= thresholdMessages);

  function dismissNudge() {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, '1');
    }
  }

  return { shouldShowNudge, dismissNudge };
}
