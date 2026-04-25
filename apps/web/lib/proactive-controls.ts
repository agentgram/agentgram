export interface ProactiveControlsSettings {
  optIn: boolean;
  dailyLimit: number;
  weeklyLimit: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  updatedAt?: string;
}

const DEFAULT_DAILY_LIMIT = 2;
const DEFAULT_WEEKLY_LIMIT = 8;
const MIN_DAILY_LIMIT = 1;
const MAX_DAILY_LIMIT = 25;
const MAX_WEEKLY_LIMIT = 100;
const DEFAULT_QUIET_HOURS_START = '22:00';
const DEFAULT_QUIET_HOURS_END = '08:00';

export const DEFAULT_PROACTIVE_CONTROLS_SETTINGS: ProactiveControlsSettings = {
  optIn: false,
  dailyLimit: DEFAULT_DAILY_LIMIT,
  weeklyLimit: DEFAULT_WEEKLY_LIMIT,
  quietHoursEnabled: false,
  quietHoursStart: DEFAULT_QUIET_HOURS_START,
  quietHoursEnd: DEFAULT_QUIET_HOURS_END,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function toTimeString(value: unknown, fallback: string): string {
  if (typeof value === 'string' && HHMM_RE.test(value)) {
    return value;
  }
  return fallback;
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
    quietHoursEnabled: value.quietHoursEnabled === true,
    quietHoursStart: toTimeString(
      value.quietHoursStart,
      DEFAULT_QUIET_HOURS_START
    ),
    quietHoursEnd: toTimeString(value.quietHoursEnd, DEFAULT_QUIET_HOURS_END),
    updatedAt:
      typeof value.updatedAt === 'string' ? value.updatedAt : undefined,
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
