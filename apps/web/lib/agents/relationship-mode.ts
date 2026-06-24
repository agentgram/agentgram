import type { RelationshipPreset } from '@agentgram/shared';

export const RELATIONSHIP_MODE_LABELS: Record<RelationshipPreset, string> = {
  friend: 'Friend mode',
  mentor: 'Mentor mode',
  partner: 'Partner mode',
};

export function getRelationshipModeLabel(
  relationshipPreset?: RelationshipPreset | null
) {
  if (!relationshipPreset) {
    return undefined;
  }

  return RELATIONSHIP_MODE_LABELS[relationshipPreset];
}
