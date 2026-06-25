export const DIRECTORY_CAPABILITY_KEYS = [
  'voice',
  'group_chat',
  'roleplay',
] as const;

export const AGENT_MODALITY_KEYS = ['voice', 'video', 'image', 'web'] as const;

export const AGENT_CAPABILITY_KEYS = [
  'voice',
  'group_chat',
  'roleplay',
  'video',
  'image',
  'web',
] as const;

export type DirectoryCapabilityKey = (typeof DIRECTORY_CAPABILITY_KEYS)[number];
export type AgentModalityKey = (typeof AGENT_MODALITY_KEYS)[number];
export type AgentCapabilityKey = (typeof AGENT_CAPABILITY_KEYS)[number];
export type DirectoryCapabilities = Record<AgentCapabilityKey, boolean>;

export const DIRECTORY_CAPABILITY_LABELS: Record<
  DirectoryCapabilityKey,
  string
> = {
  voice: 'Voice',
  group_chat: 'Group chat',
  roleplay: 'Roleplay',
};

export const AGENT_MODALITY_LABELS: Record<AgentModalityKey, string> = {
  voice: 'Voice',
  video: 'Video',
  image: 'Image',
  web: 'Web-aware',
};

const CAPABILITY_METADATA_PATHS: Record<
  AgentCapabilityKey,
  ReadonlyArray<readonly string[]>
> = {
  voice: [
    ['capabilities', 'voice'],
    ['capabilities', 'voice_reply'],
    ['capabilities', 'voiceReply'],
    ['replyModalities', 'voice'],
    ['reply_modalities', 'voice'],
  ],
  group_chat: [
    ['capabilities', 'group_chat'],
    ['capabilities', 'groupChat'],
  ],
  roleplay: [['capabilities', 'roleplay']],
  video: [
    ['capabilities', 'video'],
    ['capabilities', 'video_reply'],
    ['capabilities', 'videoReply'],
    ['replyModalities', 'video'],
    ['reply_modalities', 'video'],
  ],
  image: [
    ['capabilities', 'image'],
    ['capabilities', 'image_reply'],
    ['capabilities', 'imageReply'],
    ['replyModalities', 'image'],
    ['reply_modalities', 'image'],
  ],
  web: [
    ['capabilities', 'web'],
    ['capabilities', 'web_aware'],
    ['capabilities', 'webAware'],
    ['capabilities', 'web_aware_replies'],
    ['capabilities', 'webAwareReplies'],
    ['replyModalities', 'web'],
    ['replyModalities', 'webAware'],
    ['reply_modalities', 'web'],
    ['reply_modalities', 'web_aware'],
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function readMetadataValue(
  metadata: Record<string, unknown>,
  path: readonly string[]
): unknown {
  let current: unknown = metadata;

  for (const segment of path) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function readCapabilityFlag(
  metadata: Record<string, unknown>,
  key: AgentCapabilityKey
): boolean {
  for (const path of CAPABILITY_METADATA_PATHS[key]) {
    const value = readMetadataValue(metadata, path);
    if (typeof value === 'boolean') {
      return value;
    }
  }

  return false;
}

export function getAgentCapabilities(metadata: unknown): DirectoryCapabilities {
  const emptyCapabilities: DirectoryCapabilities = {
    voice: false,
    group_chat: false,
    roleplay: false,
    video: false,
    image: false,
    web: false,
  };

  if (!isRecord(metadata)) {
    return emptyCapabilities;
  }

  return AGENT_CAPABILITY_KEYS.reduce(
    (acc, key) => {
      acc[key] = readCapabilityFlag(metadata, key);
      return acc;
    },
    { ...emptyCapabilities }
  );
}

export function isCapabilityFilterEnabled(value: string | null): boolean {
  if (value == null) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}
