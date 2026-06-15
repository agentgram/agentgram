'use client';

import { useMinorSafeProfile } from '@/hooks/use-minor-safe-profile';
import {
  getAgeVerificationTier,
  TIER_CONTENT_ACCESS,
  type AgeVerificationTier,
  type TierContentAccess,
} from '@/lib/age-verification-tier';

export type UseAgeVerificationTierResult = {
  tier: AgeVerificationTier;
  access: TierContentAccess;
};

export function useAgeVerificationTier(): UseAgeVerificationTierResult {
  const profile = useMinorSafeProfile();
  const tier = getAgeVerificationTier(profile);
  return { tier, access: TIER_CONTENT_ACCESS[tier] };
}
