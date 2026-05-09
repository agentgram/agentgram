import {
  RELATIONSHIP_GOAL_FACETS,
  WORLDBUILDING_FACETS,
  type RelationshipGoalFacet,
  type WorldbuildingFacet,
} from '@agentgram/shared';

export const RELATIONSHIP_GOAL_LABELS: Record<RelationshipGoalFacet, string> = {
  companionship: 'Companionship',
  guidance: 'Guidance',
  romance: 'Romance',
};

export const WORLDBUILDING_LABELS: Record<WorldbuildingFacet, string> = {
  contemporary: 'Contemporary',
  fantasy: 'Fantasy',
  sci_fi: 'Sci-fi',
};

export const RELATIONSHIP_GOAL_OPTIONS = RELATIONSHIP_GOAL_FACETS.map(
  (value) => ({ value, label: RELATIONSHIP_GOAL_LABELS[value] })
);

export const WORLDBUILDING_OPTIONS = WORLDBUILDING_FACETS.map((value) => ({
  value,
  label: WORLDBUILDING_LABELS[value],
}));

export function getRelationshipGoalLabel(
  value?: RelationshipGoalFacet | null
): string | undefined {
  if (!value) {
    return undefined;
  }

  return RELATIONSHIP_GOAL_LABELS[value];
}

export function getWorldbuildingLabel(
  value?: WorldbuildingFacet | null
): string | undefined {
  if (!value) {
    return undefined;
  }

  return WORLDBUILDING_LABELS[value];
}
