export const VOICE_STYLES = ['natural', 'expressive', 'calm', 'playful'] as const;
export type VoiceStyle = (typeof VOICE_STYLES)[number];

export const VOICE_STYLE_LABELS: Record<VoiceStyle, { label: string; description: string }> = {
  natural: { label: 'Natural', description: 'Conversational and authentic' },
  expressive: { label: 'Expressive', description: 'Vivid and emotionally varied' },
  calm: { label: 'Calm', description: 'Measured and composed' },
  playful: { label: 'Playful', description: 'Light and energetic' },
};

export interface PersonalityTraits {
  warmth: number;
  humor: number;
  formality: number;
  creativity: number;
}

export interface AgentPersonalitySettings {
  traits: PersonalityTraits;
  voiceStyle: VoiceStyle;
  updatedAt?: string;
}

export const DEFAULT_PERSONALITY_SETTINGS: AgentPersonalitySettings = {
  traits: {
    warmth: 50,
    humor: 30,
    formality: 50,
    creativity: 50,
  },
  voiceStyle: 'natural',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toBoundedInt(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function toVoiceStyle(value: unknown): VoiceStyle {
  if (typeof value === 'string' && (VOICE_STYLES as readonly string[]).includes(value)) {
    return value as VoiceStyle;
  }
  return DEFAULT_PERSONALITY_SETTINGS.voiceStyle;
}

export function readPersonalityFromMetadata(metadata: unknown): AgentPersonalitySettings {
  if (!isRecord(metadata)) return DEFAULT_PERSONALITY_SETTINGS;

  const raw = metadata['personalitySettings'];
  if (!isRecord(raw)) return DEFAULT_PERSONALITY_SETTINGS;

  const traits = isRecord(raw['traits']) ? raw['traits'] : {};
  const defaults = DEFAULT_PERSONALITY_SETTINGS.traits;

  return {
    traits: {
      warmth: toBoundedInt(traits['warmth'], 0, 100, defaults.warmth),
      humor: toBoundedInt(traits['humor'], 0, 100, defaults.humor),
      formality: toBoundedInt(traits['formality'], 0, 100, defaults.formality),
      creativity: toBoundedInt(traits['creativity'], 0, 100, defaults.creativity),
    },
    voiceStyle: toVoiceStyle(raw['voiceStyle']),
    updatedAt: typeof raw['updatedAt'] === 'string' ? raw['updatedAt'] : undefined,
  };
}

export function writePersonalityToMetadata(
  metadata: unknown,
  update: { traits?: Partial<PersonalityTraits>; voiceStyle?: VoiceStyle }
): Record<string, unknown> {
  const base = isRecord(metadata) ? { ...metadata } : {};
  const existing = readPersonalityFromMetadata(metadata);

  const merged: AgentPersonalitySettings = {
    traits: {
      warmth: toBoundedInt(
        update.traits?.warmth ?? existing.traits.warmth,
        0, 100, DEFAULT_PERSONALITY_SETTINGS.traits.warmth
      ),
      humor: toBoundedInt(
        update.traits?.humor ?? existing.traits.humor,
        0, 100, DEFAULT_PERSONALITY_SETTINGS.traits.humor
      ),
      formality: toBoundedInt(
        update.traits?.formality ?? existing.traits.formality,
        0, 100, DEFAULT_PERSONALITY_SETTINGS.traits.formality
      ),
      creativity: toBoundedInt(
        update.traits?.creativity ?? existing.traits.creativity,
        0, 100, DEFAULT_PERSONALITY_SETTINGS.traits.creativity
      ),
    },
    voiceStyle: toVoiceStyle(update.voiceStyle ?? existing.voiceStyle),
    updatedAt: new Date().toISOString(),
  };

  return { ...base, personalitySettings: merged };
}
