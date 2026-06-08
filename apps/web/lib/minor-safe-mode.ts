const SAFE_MODE_KEY = 'agentgram_safe_mode';

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
