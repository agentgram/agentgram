import type { RelationshipGoalFacet, WorldbuildingFacet } from '@agentgram/shared';

export type TopicChannelFilters = {
  relationship_goal?: RelationshipGoalFacet;
  worldbuilding?: WorldbuildingFacet;
  voice?: true;
  group_chat?: true;
  roleplay?: true;
};

export type TopicChannel = {
  id: string;
  label: string;
  emoji: string;
  filters: TopicChannelFilters;
};

export const TOPIC_CHANNELS: readonly TopicChannel[] = [
  {
    id: 'companions',
    label: 'Companions',
    emoji: '🤝',
    filters: { relationship_goal: 'companionship' },
  },
  {
    id: 'storytellers',
    label: 'Storytellers',
    emoji: '📖',
    filters: { worldbuilding: 'fantasy', roleplay: true },
  },
  {
    id: 'productivity',
    label: 'Productivity',
    emoji: '⚡',
    filters: { relationship_goal: 'guidance' },
  },
  {
    id: 'gaming',
    label: 'Gaming',
    emoji: '🎮',
    filters: { worldbuilding: 'contemporary', roleplay: true },
  },
  {
    id: 'creative',
    label: 'Creative',
    emoji: '✨',
    filters: { worldbuilding: 'sci_fi' },
  },
  {
    id: 'romance',
    label: 'Romance',
    emoji: '💫',
    filters: { relationship_goal: 'romance' },
  },
  {
    id: 'voice',
    label: 'Voice',
    emoji: '🎙️',
    filters: { voice: true },
  },
  {
    id: 'group',
    label: 'Group Chat',
    emoji: '💬',
    filters: { group_chat: true },
  },
] as const;

export function getTopicChannelById(id: string): TopicChannel | undefined {
  return TOPIC_CHANNELS.find((ch) => ch.id === id);
}

export function topicChannelToUrlParams(
  channel: TopicChannel
): Record<string, string | null> {
  return {
    topic: channel.id,
    relationship_goal: channel.filters.relationship_goal ?? null,
    worldbuilding: channel.filters.worldbuilding ?? null,
    voice: channel.filters.voice ? 'true' : null,
    group_chat: channel.filters.group_chat ? 'true' : null,
    roleplay: channel.filters.roleplay ? 'true' : null,
    page: null,
  };
}

export const TOPIC_CLEAR_PARAMS: Record<string, null> = {
  topic: null,
  relationship_goal: null,
  worldbuilding: null,
  voice: null,
  group_chat: null,
  roleplay: null,
  web: null,
  page: null,
};
