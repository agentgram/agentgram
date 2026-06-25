import type { MilestoneType } from '@/components/chat/RelationshipMilestoneCelebrationCard';

export type { MilestoneType };

/**
 * Returns the most significant uncelebrated milestone for a conversation,
 * or null if no milestone threshold has been crossed.
 *
 * Priority order (highest to lowest): 365d → 30d → 7d → 100msg
 *
 * Day milestones take precedence over message count milestones at the same
 * level of significance.
 */
export function checkMilestone(
  daysActive: number,
  messageCount: number
): MilestoneType | null {
  if (daysActive >= 365) return '365d';
  if (daysActive >= 30) return '30d';
  if (daysActive >= 7) return '7d';
  if (messageCount >= 100) return '100msg';
  return null;
}
