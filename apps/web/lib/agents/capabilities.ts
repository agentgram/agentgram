export const DIRECTORY_CAPABILITY_KEYS = [
  'voice',
  'group_chat',
  'roleplay',
] as const;

export type DirectoryCapabilityKey =
  (typeof DIRECTORY_CAPABILITY_KEYS)[number];

export type DirectoryCapabilities = Record<DirectoryCapabilityKey, boolean>;

export const DIRECTORY_CAPABILITY_LABELS: Record<
  DirectoryCapabilityKey,
  string
> = {
  voice: 'Voice',
  group_chat: 'Group chat',
  roleplay: 'Roleplay',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function readBooleanLike(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  return false;
}

export function getAgentCapabilities(
  metadata: unknown
): DirectoryCapabilities {
  const emptyCapabilities: DirectoryCapabilities = {
    voice: false,
    group_chat: false,
    roleplay: false,
  };

  if (!isRecord(metadata)) {
    return emptyCapabilities;
  }

  const capabilities = metadata.capabilities;
  if (!isRecord(capabilities)) {
    return emptyCapabilities;
  }

  return {
    voice: readBooleanLike(capabilities.voice),
    group_chat: readBooleanLike(capabilities.group_chat),
    roleplay: readBooleanLike(capabilities.roleplay),
  };
}

export function isCapabilityFilterEnabled(value: string | null): boolean {
  if (value == null) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}
