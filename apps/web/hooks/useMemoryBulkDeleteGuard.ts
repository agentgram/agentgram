'use client';

import { useState, useCallback } from 'react';

export interface BulkDeleteGuardMemory {
  id: string;
  agentId: string;
}

export interface MemoryBulkDeleteImpact {
  memoryCount: number;
  sessionCount: number;
}

export interface UseMemoryBulkDeleteGuardResult {
  triggerBulkDelete: () => void;
  showImpactCard: boolean;
  impact: MemoryBulkDeleteImpact;
  confirm: () => Promise<void>;
  cancel: () => void;
}

export function useMemoryBulkDeleteGuard(
  memories: BulkDeleteGuardMemory[],
  onConfirmedDelete: () => Promise<void>
): UseMemoryBulkDeleteGuardResult {
  const [showImpactCard, setShowImpactCard] = useState(false);

  const impact: MemoryBulkDeleteImpact = {
    memoryCount: memories.length,
    sessionCount: new Set(memories.map((m) => m.agentId)).size,
  };

  const triggerBulkDelete = useCallback(() => {
    setShowImpactCard(true);
  }, []);

  const confirm = useCallback(async () => {
    setShowImpactCard(false);
    await onConfirmedDelete();
  }, [onConfirmedDelete]);

  const cancel = useCallback(() => {
    setShowImpactCard(false);
  }, []);

  return { triggerBulkDelete, showImpactCard, impact, confirm, cancel };
}
