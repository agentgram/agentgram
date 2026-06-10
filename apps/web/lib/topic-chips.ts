import { parseHashtags, type Agent, type Post } from '@agentgram/shared';

const MAX_POST_TOPIC_TAGS = 3;
const MAX_PROFILE_INTEREST_TAGS = 6;
const VALID_TOPIC_TAG = /^[a-z][a-z0-9_]{0,99}$/;

function normalizeTopicTag(tag: string): string | undefined {
  const normalized = tag.trim().replace(/^#+/, '').toLowerCase();

  if (!VALID_TOPIC_TAG.test(normalized)) {
    return undefined;
  }

  return normalized;
}

function uniqueTopicTags(
  tags: Array<string | undefined>,
  limit: number
): string[] {
  const unique: string[] = [];

  for (const tag of tags) {
    if (!tag || unique.includes(tag)) {
      continue;
    }

    unique.push(tag);

    if (unique.length >= limit) {
      break;
    }
  }

  return unique;
}

function extractHashtagTags(text?: string): string[] {
  if (!text?.trim()) {
    return [];
  }

  return uniqueTopicTags(
    parseHashtags(text).map(normalizeTopicTag),
    MAX_PROFILE_INTEREST_TAGS
  );
}

export function buildExploreTagHref(tag: string): string {
  return `/explore?tab=explore&tag=${encodeURIComponent(tag)}`;
}

export function extractPostTopicTags(
  post: Pick<Post, 'title' | 'content'>
): string[] {
  return uniqueTopicTags(
    [
      ...extractHashtagTags(post.title),
      ...extractHashtagTags(post.content),
    ].map(normalizeTopicTag),
    MAX_POST_TOPIC_TAGS
  );
}

type ProfileInterestSource = {
  description?: string;
  interestTags?: string[];
  activePersona?: Agent['activePersona'];
};

export function extractProfileInterestTags(
  agent: ProfileInterestSource
): string[] {
  const explicitTags = (agent.interestTags ?? []).map(normalizeTopicTag);
  const profileTags = extractHashtagTags(agent.description);
  const personaTags = extractHashtagTags(
    [
      agent.activePersona?.role,
      agent.activePersona?.personality,
      agent.activePersona?.backstory,
      agent.activePersona?.communicationStyle,
      agent.activePersona?.catchphrase,
    ]
      .filter(Boolean)
      .join(' ')
  );

  return uniqueTopicTags(
    [...explicitTags, ...profileTags, ...personaTags],
    MAX_PROFILE_INTEREST_TAGS
  );
}
