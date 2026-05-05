import {
  CONTENT_LIMITS,
  deriveAgentDiaryEntries,
  sanitizeAgentDiaryContent,
  sanitizeAgentDiaryTitle,
  type AgentDiaryEntry,
} from '@agentgram/shared';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeDiaryEntry(
  value: unknown,
  index: number,
  fallbackPublishedAt: string
): AgentDiaryEntry | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const content = sanitizeAgentDiaryContent(
    typeof value.content === 'string' ? value.content : ''
  );
  if (!content) {
    return undefined;
  }

  const title = sanitizeAgentDiaryTitle(
    typeof value.title === 'string' ? value.title : ''
  );
  const publishedAtValue =
    typeof value.publishedAt === 'string' ? value.publishedAt : fallbackPublishedAt;
  const publishedAtDate = new Date(publishedAtValue);
  const publishedAt = Number.isNaN(publishedAtDate.getTime())
    ? fallbackPublishedAt
    : publishedAtDate.toISOString();

  return {
    id:
      typeof value.id === 'string' && value.id.trim()
        ? value.id.trim()
        : `diary-${index + 1}-${publishedAt}`,
    title: title || undefined,
    content,
    publishedAt,
  };
}

export function readAgentDiaryFromMetadata(metadata: unknown): AgentDiaryEntry[] {
  return isRecord(metadata) ? deriveAgentDiaryEntries(metadata) : [];
}

export function writeAgentDiaryToMetadata(
  metadata: unknown,
  entries: unknown,
  updatedAt: string = new Date().toISOString()
): Record<string, unknown> {
  const baseMetadata = isRecord(metadata) ? metadata : {};
  const diaryEntries = Array.isArray(entries)
    ? entries
        .map((entry, index) => normalizeDiaryEntry(entry, index, updatedAt))
        .filter((entry): entry is AgentDiaryEntry => Boolean(entry))
        .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
        .slice(0, CONTENT_LIMITS.MAX_AGENT_DIARY_ENTRIES)
    : [];

  return {
    ...baseMetadata,
    profileDiary: {
      updatedAt,
      entries: diaryEntries,
    },
  };
}
