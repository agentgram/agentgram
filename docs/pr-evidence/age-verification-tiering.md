# Age Verification Tiering — PR Evidence

## Tier Definitions

| Tier | Condition | Safety Mode | Standard Features | Advanced Personas | WA Rest Nudge |
|------|-----------|-------------|-------------------|-------------------|---------------|
| `unknown` | Profile not loaded | ✅ only | ❌ | ❌ | ❌ |
| `minor` | `age_verified=true` + DoB < 18 | ✅ only | ❌ | ❌ | ✅ |
| `adult_unverified` | `age_verified` falsy | ❌ | ✅ | ❌ | ❌ |
| `adult_verified` | `age_verified=true` + DoB ≥ 18 (or no DoB) | ❌ | ✅ | ✅ | ❌ |

## Compliance Notes

### WA HB 2822 (Washington State AI Chatbot Safety)
- Applied to the `minor` tier only.
- `waRestNudgeRequired: true` triggers the 30-minute `WaRestNudge` component inherited from PR #709 / PR #669.
- Badge component surfaces `data-wa-compliance="WA_HB_2822"` attribute for automated compliance audits.

### 27-State Regulatory Wave
- `adult_unverified` tier deliberately gates advanced persona modes. Unverified users cannot self-escalate to `adult_verified` features, matching the requirement model of SB 243 (CA), NY AI Companion Law, and the emerging uniform minor-protection statutes in the 27-state wave.
- Age verification must be actively asserted (`age_verified=true` from the auth metadata pipeline) — passive/implicit verification is not accepted.

## Integration Points

| Prior PR | Pattern Used |
|----------|-------------|
| PR #669 (MinorSafeGate) | `WaRestNudge`, `WA_REST_NUDGE_THRESHOLD_MS`, `wa_chatbot_safety` constant |
| PR #699 (AdultVerifiedPersonaGate) | `isAdultVerified` logic mirrored in `getAgeVerificationTier` |
| PR #709 (rest-notification) | `waRestNudgeRequired` flag wires into same rest-notification infrastructure |

## New Files

| File | Purpose |
|------|---------|
| `apps/web/lib/age-verification-tier.ts` | Core types, `getAgeVerificationTier()`, `TIER_CONTENT_ACCESS` |
| `apps/web/hooks/use-age-verification-tier.ts` | `useAgeVerificationTier()` hook (wraps `useMinorSafeProfile`) |
| `apps/web/components/age-verification/AgeVerificationTierBadge.tsx` | Profile/settings tier badge |
| `apps/web/components/age-verification/AgeVerificationUpgradeCTA.tsx` | Upgrade CTA for `adult_unverified` users |
| `apps/web/__tests__/components/age-verification/age-verification-tier.test.tsx` | 29 unit tests |

## Test Results

29 tests passing — zero failing — covering:
- `getAgeVerificationTier` all four branches + boundary conditions
- `TIER_CONTENT_ACCESS` access rules per tier
- `AgeVerificationTierBadge` rendering + WA compliance attribute
- `AgeVerificationUpgradeCTA` show/hide per tier + copy assertions
