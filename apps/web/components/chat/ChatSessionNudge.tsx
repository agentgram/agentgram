'use client';

import { useSessionTimer } from '@/hooks/use-session-timer';
import { WellbeingNudgeCard } from '@/components/common/WellbeingNudgeCard';

interface ChatSessionNudgeProps {
  /** Unix timestamp (ms) when the current chat session started. */
  sessionStartedAt?: number;
  /** Optional wellness resource URL surfaced in the nudge card. */
  resourceUrl?: string;
  /** Link label for the resource URL. */
  resourceLabel?: string;
}

/**
 * Renders a {@link WellbeingNudgeCard} after the user has been in a continuous
 * chat session for ≥60 minutes. Dismissing hides it for the remainder of the
 * session.
 *
 * Mount this anywhere inside the chat page; it renders nothing until the
 * threshold is reached.
 */
export function ChatSessionNudge({
  sessionStartedAt,
  resourceUrl,
  resourceLabel,
}: ChatSessionNudgeProps) {
  const { shouldShowNudge, dismissNudge } = useSessionTimer({ sessionStartedAt });

  if (!shouldShowNudge) return null;

  return (
    <WellbeingNudgeCard
      onDismiss={dismissNudge}
      resourceUrl={resourceUrl}
      resourceLabel={resourceLabel}
    />
  );
}
