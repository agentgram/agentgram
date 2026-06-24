'use client';

import { useState, useEffect, useRef } from 'react';
import { WELLBEING_NUDGE_THRESHOLD_MS } from '@/components/common/WellbeingNudgeCard';

interface UseSessionTimerOptions {
  /** Override the threshold (ms) at which the nudge fires. Defaults to WELLBEING_NUDGE_THRESHOLD_MS (60 min). */
  thresholdMs?: number;
  /** Unix timestamp (ms) when the chat session started. Defaults to the time the hook first mounted. */
  sessionStartedAt?: number;
}

interface UseSessionTimerResult {
  /** True when the user has been chatting continuously past the threshold. */
  shouldShowNudge: boolean;
  /** Call to dismiss the nudge and prevent it from re-appearing for this session. */
  dismissNudge: () => void;
}

/**
 * Tracks continuous chat session duration and surfaces a wellbeing nudge
 * once the user has been active for ≥60 minutes.
 */
export function useSessionTimer({
  thresholdMs = WELLBEING_NUDGE_THRESHOLD_MS,
  sessionStartedAt,
}: UseSessionTimerOptions = {}): UseSessionTimerResult {
  const [startTime] = useState<number>(() => sessionStartedAt ?? Date.now());
  const startRef = useRef<number>(startTime);
  const [shouldShowNudge, setShouldShowNudge] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const elapsed = Date.now() - startRef.current;
    const remaining = thresholdMs - elapsed;

    if (remaining <= 0) {
      setShouldShowNudge(true);
      return;
    }

    const timer = setTimeout(() => setShouldShowNudge(true), remaining);
    return () => clearTimeout(timer);
  }, [thresholdMs, dismissed]);

  function dismissNudge() {
    setShouldShowNudge(false);
    setDismissed(true);
  }

  return { shouldShowNudge, dismissNudge };
}
