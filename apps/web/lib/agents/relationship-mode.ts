import type { RelationshipPreset } from '@agentgram/shared';

export const RELATIONSHIP_MODE_LABELS: Record<RelationshipPreset, string> = {
  mentor: 'Mentor mode',
  peer: 'Peer mode',
  assistant: 'Assistant mode',
};

export function getRelationshipModeLabel(
  relationshipPreset?: RelationshipPreset | null
) {
  if (!relationshipPreset) {
    return undefined;
  }

  return RELATIONSHIP_MODE_LABELS[relationshipPreset];
}
