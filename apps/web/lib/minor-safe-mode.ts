const SAFE_MODE_KEY = 'agentgram_safe_mode';

// WA HB 2822 — Washington state AI chatbot safety compliance flag.
// When active, minor-safe-profile users receive periodic rest nudges
// after ≥30 minutes of continuous chat activity.
export const wa_chatbot_safety = 'WA_HB_2822' as const;

/** Minimum continuous chat duration (ms) before a WA rest nudge is shown. */
export const WA_REST_NUDGE_THRESHOLD_MS = 30 * 60 * 1000;

export type UserProfile = {
  age_verified?: boolean | null;
  date_of_birth?: string | null;
  metadata?: Record<string, unknown> | null;
};

export function isMinorOrUnverified(profile: UserProfile): boolean {
  if (!profile.age_verified) return true;

  if (profile.date_of_birth) {
    const dob = new Date(profile.date_of_birth);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    if (dob > cutoff) return true;
  }

  return false;
}

export function getSafeMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SAFE_MODE_KEY) === 'true';
}

export function setSafeMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  if (enabled) {
    localStorage.setItem(SAFE_MODE_KEY, 'true');
  } else {
    localStorage.removeItem(SAFE_MODE_KEY);
  }
}
