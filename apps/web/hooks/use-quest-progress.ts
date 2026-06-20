'use client';

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'agentgram:quest-progress';

type QuestProgressStore = Record<string, number>; // questId → currentPart (1–3)

function readStore(): QuestProgressStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QuestProgressStore) : {};
  } catch {
    return {};
  }
}

function persistStore(store: QuestProgressStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // private-mode or quota exceeded — ignore
  }
}

export interface UseQuestProgressResult {
  /** Returns the 1-indexed current part for a quest (defaults to 1 if not started). */
  getQuestPart: (questId: string) => number;
  /** Records a quest as started (part 1) and fires the external session-start handler. */
  startQuestSession: (questId: string) => void;
}

export function useQuestProgress(): UseQuestProgressResult {
  const [store, setStore] = useState<QuestProgressStore>(() => readStore());

  const getQuestPart = useCallback(
    (questId: string): number => store[questId] ?? 1,
    [store]
  );

  const startQuestSession = useCallback((questId: string): void => {
    setStore((prev) => {
      // Preserve progress if the quest has already been started
      if (questId in prev) return prev;
      const next = { ...prev, [questId]: 1 };
      persistStore(next);
      return next;
    });
  }, []);

  return { getQuestPart, startQuestSession };
}
