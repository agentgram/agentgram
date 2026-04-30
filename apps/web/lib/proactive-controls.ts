export const TONE_PRESETS = ['warm', 'neutral', 'brief'] as const;
export type TonePreset = (typeof TONE_PRESETS)[number];

export interface ProactiveControlsSettings {
  optIn: boolean;
  dailyLimit: number;
  weeklyLimit: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  tonePreset: TonePreset;
  updatedAt?: string;
  lastAutoMessageAt?: string;
  nextEligibleSendAt?: string;
}

const DEFAULT_DAILY_LIMIT = 2;
const DEFAULT_WEEKLY_LIMIT = 8;
const MIN_DAILY_LIMIT = 1;
const MAX_DAILY_LIMIT = 25;
const MAX_WEEKLY_LIMIT = 100;
const DEFAULT_QUIET_HOURS_START = '22:00';
const DEFAULT_QUIET_HOURS_END = '08:00';
const DEFAULT_TONE_PRESET: TonePreset = 'neutral';
const SEOUL_UTC_OFFSET_MS = 9 * 60 * 60 * 1000;

export const DEFAULT_PROACTIVE_CONTROLS_SETTINGS: ProactiveControlsSettings = {
  optIn: false,
  dailyLimit: DEFAULT_DAILY_LIMIT,
  weeklyLimit: DEFAULT_WEEKLY_LIMIT,
  quietHoursEnabled: false,
  quietHoursStart: DEFAULT_QUIET_HOURS_START,
  quietHoursEnd: DEFAULT_QUIET_HOURS_END,
  tonePreset: DEFAULT_TONE_PRESET,
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

function toIsoTimestamp(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
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

  const tonePreset: TonePreset =
    typeof value.tonePreset === 'string' &&
    (TONE_PRESETS as readonly string[]).includes(value.tonePreset)
      ? (value.tonePreset as TonePreset)
      : DEFAULT_TONE_PRESET;

  const lastAutoMessageAt = toIsoTimestamp(value.lastAutoMessageAt);
  const nextEligibleSendAt = toIsoTimestamp(value.nextEligibleSendAt);

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
    tonePreset,
    updatedAt:
      typeof value.updatedAt === 'string' ? value.updatedAt : undefined,
    ...(lastAutoMessageAt ? { lastAutoMessageAt } : {}),
    ...(nextEligibleSendAt ? { nextEligibleSendAt } : {}),
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

function shiftToSeoul(date: Date): Date {
  return new Date(date.getTime() + SEOUL_UTC_OFFSET_MS);
}

function shiftFromSeoul(date: Date): Date {
  return new Date(date.getTime() - SEOUL_UTC_OFFSET_MS);
}

function applyTime(date: Date, hhmm: string): Date {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const next = new Date(date);
  next.setUTCHours(hours, minutes, 0, 0);
  return next;
}

export function getNextEligibleSendAt(
  settings: ProactiveControlsSettings,
  now: Date = new Date()
): string | null {
  if (!settings.optIn) {
    return null;
  }

  if (settings.nextEligibleSendAt) {
    return settings.nextEligibleSendAt;
  }

  if (!settings.quietHoursEnabled) {
    return now.toISOString();
  }

  const seoulNow = shiftToSeoul(now);
  const quietStart = applyTime(seoulNow, settings.quietHoursStart);
  const quietEnd = applyTime(seoulNow, settings.quietHoursEnd);
  const isSameDayWindow = quietStart.getTime() <= quietEnd.getTime();

  const withinQuietHours = isSameDayWindow
    ? seoulNow >= quietStart && seoulNow < quietEnd
    : seoulNow >= quietStart || seoulNow < quietEnd;

  if (!withinQuietHours) {
    return now.toISOString();
  }

  const nextEligible = new Date(quietEnd);
  if (nextEligible <= seoulNow) {
    nextEligible.setUTCDate(nextEligible.getUTCDate() + 1);
  }

  return shiftFromSeoul(nextEligible).toISOString();
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
