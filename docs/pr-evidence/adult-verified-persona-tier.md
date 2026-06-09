# Adult-Verified Persona Tier Toggle — PR Evidence

## Summary

Gates "bolder" persona modes behind age-verified identity check. Complements the
existing `MinorSafeGate` (under-18 block) with the adult-unlock counterpart,
matching Character.AI Bolder Energy parity while staying SB 243 / NY AI
Companion Law compliant.

## Compliance contract

| Gate | Condition | Effect |
|------|-----------|--------|
| `MinorSafeGate` | `isMinorOrUnverified(profile)` | Blocks companion/roleplay entirely; offers Safe Mode opt-out |
| `AdultVerifiedPersonaGate` | `!isAdultVerified(profile)` | Hides bolder persona settings; prompts age verification; **no opt-out** |

The two components are the two sides of the same compliance contract:

```
Under 18 / unverified  ──→  MinorSafeGate blocks feature
18+ verified adult     ──→  AdultVerifiedPersonaGate unlocks bolder tier
```

## Before

- No persona tier concept existed.
- All users saw the same persona options regardless of age-verification status.
- "Bolder" persona modes were either absent or accessible to everyone.

## After

### New files

| File | Purpose |
|------|---------|
| `apps/web/lib/persona/index.ts` | `PersonaTier = 'standard' \| 'adult_verified'` type + `isAdultVerified(profile)` util |
| `apps/web/components/persona/AdultVerifiedPersonaGate.tsx` | Gate component — blurs children and shows verify CTA for unverified users |
| `apps/web/components/dashboard/PersonaTierCard.tsx` | Settings card using the gate; lists tier options for verified adults |
| `apps/web/__tests__/components/persona/AdultVerifiedPersonaGate.test.tsx` | 18 tests covering util + component in both verified and unverified states |

### Modified files

| File | Change |
|------|--------|
| `apps/web/components/dashboard/index.ts` | Exports `PersonaTierCard` |
| `apps/web/app/(protected)/dashboard/settings/page.tsx` | Extracts `userProfile` from Supabase user metadata; renders `PersonaTierCard` at the top of the settings page |

## Gate behavior

### Unverified user (gate active)

```
┌──────────────────────────────────────────────┐
│  [blurred: tier options behind glass]         │
│                                              │
│  ┌────────────────────────────────────┐       │
│  │  🔒  Verify your age to unlock    │       │
│  │      mature persona modes          │       │
│  │                                    │       │
│  │  Bolder persona tiers available   │       │
│  │  to verified adults only…          │       │
│  │                                    │       │
│  │  ✅ Age verification is private…  │       │
│  │                                    │       │
│  │       [ Verify Age → ]             │       │
│  └────────────────────────────────────┘       │
└──────────────────────────────────────────────┘
```

- `data-testid="adult-verified-persona-gate"` present
- `data-testid="adult-gate-privacy-copy"` shows "no biometric data" message
- CTA links to `/dashboard/settings`

### Verified adult (gate bypassed)

- Component renders `{children}` directly.
- No overlay, no blur.
- `data-testid="adult-verified-persona-gate"` absent from DOM.

## Test coverage

```
isAdultVerified
  ✓ returns false when age_verified is false
  ✓ returns false when age_verified is null
  ✓ returns false when age_verified is undefined
  ✓ returns false when verified but under 18
  ✓ returns true when age_verified=true and over 18
  ✓ returns true when age_verified=true and no date_of_birth
  ✓ returns false exactly at 18-year boundary (one day under)
  ✓ returns true exactly at 18-year boundary (one day over)

AdultVerifiedPersonaGate
  ✓ shows gate overlay when age_verified is false
  ✓ shows gate overlay when profile has no age_verified field
  ✓ renders children without gate when user is verified adult
  ✓ renders children without gate when age_verified=true and no dob
  ✓ gate overlay shows "Verify Age" CTA link to settings
  ✓ gate overlay includes compliance copy mentioning SB 243
  ✓ gate overlay shows privacy copy with no-biometric message
  ✓ blurs children behind the gate overlay
  ✓ gate is shown for a 17-year-old with age_verified=true
  ✓ renders nothing before mount (SSR guard)
```

## Key design decisions

1. **No opt-out** — unlike `MinorSafeGate` which offers a "Continue in Safe Mode"
   escape hatch, `AdultVerifiedPersonaGate` has no bypass. Bolder modes require
   verified status; no localStorage flag can override this.

2. **Composable, not merged** — the two gates are separate components because their
   conditions are distinct. `MinorSafeGate` protects the user (minor safety);
   `AdultVerifiedPersonaGate` unlocks a premium feature (adult content). Merging
   them would conflate safety and feature access.

3. **`isAdultVerified` is NOT `!isMinorOrUnverified`** — while the logic is
   semantically opposite, having a dedicated util avoids coupling and makes each
   function's intent clear in call sites.
