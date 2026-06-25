import type { UserProfile } from '@/lib/minor-safe-mode';

export type AgeVerificationTier = 'unknown' | 'minor' | 'adult_unverified' | 'adult_verified';

export const TIER_LABELS: Record<AgeVerificationTier, string> = {
  unknown: 'Verifying…',
  minor: 'Minor (Under 18)',
  adult_unverified: 'Adult — Unverified',
  adult_verified: 'Adult — Verified',
};

export const TIER_DESCRIPTIONS: Record<AgeVerificationTier, string> = {
  unknown: 'Loading your verification status.',
  minor:
    'Safety-mode features only. Periodic rest reminders are active per WA HB 2822.',
  adult_unverified:
    'Standard features available. Verify your age to unlock all content and persona modes.',
  adult_verified: 'Full access — all features and persona modes unlocked.',
};

/** Derive a user's AgeVerificationTier from their profile.
 *
 * Rules:
 *   null profile          → 'unknown'
 *   age_verified falsy    → 'adult_unverified'
 *   verified + dob < 18   → 'minor'
 *   verified otherwise    → 'adult_verified'
 */
export function getAgeVerificationTier(
  profile: UserProfile | null
): AgeVerificationTier {
  if (!profile) return 'unknown';

  const { age_verified, date_of_birth } = profile;

  if (!age_verified) return 'adult_unverified';

  if (date_of_birth) {
    const dob = new Date(date_of_birth);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    if (dob > cutoff) return 'minor';
  }

  return 'adult_verified';
}

export type TierContentAccess = {
  safetyModeOnly: boolean;
  standardFeatures: boolean;
  advancedPersonas: boolean;
  waRestNudgeRequired: boolean;
};

export const TIER_CONTENT_ACCESS: Record<AgeVerificationTier, TierContentAccess> =
  {
    unknown: {
      safetyModeOnly: true,
      standardFeatures: false,
      advancedPersonas: false,
      waRestNudgeRequired: false,
    },
    minor: {
      safetyModeOnly: true,
      standardFeatures: false,
      advancedPersonas: false,
      waRestNudgeRequired: true,
    },
    adult_unverified: {
      safetyModeOnly: false,
      standardFeatures: true,
      advancedPersonas: false,
      waRestNudgeRequired: false,
    },
    adult_verified: {
      safetyModeOnly: false,
      standardFeatures: true,
      advancedPersonas: true,
      waRestNudgeRequired: false,
    },
  };
