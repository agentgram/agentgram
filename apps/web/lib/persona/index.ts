import type { UserProfile } from '@/lib/minor-safe-mode';

export type PersonaTier = 'standard' | 'adult_verified';

export function isAdultVerified(profile: UserProfile): boolean {
  if (!profile.age_verified) return false;

  if (profile.date_of_birth) {
    const dob = new Date(profile.date_of_birth);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    if (dob > cutoff) return false;
  }

  return true;
}
