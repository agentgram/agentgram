import {
  CONTENT_LIMITS,
  sanitizeLorebookEntryDetails,
  sanitizeLorebookEntryName,
  sanitizeLorebookEntryRole,
  sanitizeLorebookRuleTitle,
  type AgentLorebook,
  type LorebookPersonEntry,
  type LorebookPlaceEntry,
  type LorebookRuleEntry,
} from '@agentgram/shared';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeId(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizePerson(
  value: unknown,
  index: number
): LorebookPersonEntry | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const name = sanitizeLorebookEntryName(
    typeof value.name === 'string' ? value.name : ''
  );
  if (!name) {
    return undefined;
  }

  const role = sanitizeLorebookEntryRole(
    typeof value.role === 'string' ? value.role : ''
  );
  const details = sanitizeLorebookEntryDetails(
    typeof value.details === 'string' ? value.details : ''
  );

  return {
    id: normalizeId(value.id, `person-${index + 1}`),
    name,
    role: role || undefined,
    details: details || undefined,
  };
}

function normalizePlace(
  value: unknown,
  index: number
): LorebookPlaceEntry | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const name = sanitizeLorebookEntryName(
    typeof value.name === 'string' ? value.name : ''
  );
  if (!name) {
    return undefined;
  }

  const details = sanitizeLorebookEntryDetails(
    typeof value.details === 'string' ? value.details : ''
  );

  return {
    id: normalizeId(value.id, `place-${index + 1}`),
    name,
    details: details || undefined,
  };
}

function normalizeRule(
  value: unknown,
  index: number
): LorebookRuleEntry | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const title = sanitizeLorebookRuleTitle(
    typeof value.title === 'string' ? value.title : ''
  );
  if (!title) {
    return undefined;
  }

  const details = sanitizeLorebookEntryDetails(
    typeof value.details === 'string' ? value.details : ''
  );

  return {
    id: normalizeId(value.id, `rule-${index + 1}`),
    title,
    details: details || undefined,
  };
}

function normalizeCollection<T>(
  value: unknown,
  normalizeEntry: (entry: unknown, index: number) => T | undefined
): T[] {
  return Array.isArray(value)
    ? value
        .map((entry, index) => normalizeEntry(entry, index))
        .filter((entry): entry is T => Boolean(entry))
        .slice(0, CONTENT_LIMITS.MAX_LOREBOOK_ENTRIES_PER_SECTION)
    : [];
}

export function normalizeAgentLorebook(value: unknown): AgentLorebook {
  const record = isRecord(value) ? value : {};
  const updatedAt =
    typeof record.updatedAt === 'string' && record.updatedAt.trim()
      ? record.updatedAt
      : undefined;

  return {
    people: normalizeCollection(record.people, normalizePerson),
    places: normalizeCollection(record.places, normalizePlace),
    rules: normalizeCollection(record.rules, normalizeRule),
    updatedAt,
  };
}

export function readAgentLorebookFromMetadata(
  metadata: unknown
): AgentLorebook {
  if (!isRecord(metadata)) {
    return { people: [], places: [], rules: [] };
  }

  return normalizeAgentLorebook(metadata.lorebook);
}

export function writeAgentLorebookToMetadata(
  metadata: unknown,
  lorebook: unknown,
  updatedAt: string = new Date().toISOString()
): Record<string, unknown> {
  const baseMetadata = isRecord(metadata) ? metadata : {};
  const normalized = normalizeAgentLorebook(lorebook);

  return {
    ...baseMetadata,
    lorebook: {
      updatedAt,
      people: normalized.people,
      places: normalized.places,
      rules: normalized.rules,
    },
  };
}
