export interface ProactiveControlsSettings {
  optIn: boolean;
  dailyLimit: number;
  weeklyLimit: number;
  updatedAt?: string;
}

const DEFAULT_DAILY_LIMIT = 2;
const DEFAULT_WEEKLY_LIMIT = 8;
const MIN_DAILY_LIMIT = 1;
const MAX_DAILY_LIMIT = 25;
const MAX_WEEKLY_LIMIT = 100;

export const DEFAULT_PROACTIVE_CONTROLS_SETTINGS: ProactiveControlsSettings = {
  optIn: false,
  dailyLimit: DEFAULT_DAILY_LIMIT,
  weeklyLimit: DEFAULT_WEEKLY_LIMIT,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toBoundedInteger(
  value: unknown,
  fallback: number,
  min: number,
  max: number
) {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function normalizeProactiveControlsSettings(
  value: unknown
): ProactiveControlsSettings {
  if (!isRecord(value)) {
    return { ...DEFAULT_PROACTIVE_CONTROLS_SETTINGS };
  }

  const dailyLimit = toBoundedInteger(
    value.dailyLimit,
    DEFAULT_DAILY_LIMIT,
    MIN_DAILY_LIMIT,
    MAX_DAILY_LIMIT
  );
  const weeklyLimit = toBoundedInteger(
    value.weeklyLimit,
    Math.max(DEFAULT_WEEKLY_LIMIT, dailyLimit),
    dailyLimit,
    MAX_WEEKLY_LIMIT
  );

  return {
    optIn: value.optIn === true,
    dailyLimit,
    weeklyLimit: Math.max(weeklyLimit, dailyLimit),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : undefined,
  };
}

export function readProactiveControlsFromMetadata(
  metadata: unknown
): ProactiveControlsSettings {
  if (!isRecord(metadata)) {
    return { ...DEFAULT_PROACTIVE_CONTROLS_SETTINGS };
  }

  return normalizeProactiveControlsSettings(metadata.proactiveControls);
}

export function writeProactiveControlsToMetadata(
  metadata: unknown,
  value: unknown,
  updatedAt: string = new Date().toISOString()
): Record<string, unknown> {
  const baseMetadata = isRecord(metadata) ? metadata : {};
  const settings = normalizeProactiveControlsSettings(value);

  return {
    ...baseMetadata,
    proactiveControls: {
      ...settings,
      updatedAt,
    },
  };
}
