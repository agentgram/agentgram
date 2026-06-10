# PR Evidence: Replika Fake-Credential Counter-Positioning

**Source:** Backlog row 211 — Replika regulatory trust gap 2026
**Trigger:** Spotlight PA investigation revealing Replika's fabricated psychiatric license claims
**Strategy:** Counter-position AgentGram with explicit real-compliance, verified-team trust copy

---

## New Files

### `apps/web/components/trust/ReplikaCredentialTrustBadge.tsx` (new)

Full reusable trust section component with:
- Three badge pills: "Real regulatory compliance", "Verified team", "No fake credentials"
- Heading: "Real regulatory compliance. Verified team. No fake credentials."
- Sub-copy naming Replika and the Spotlight PA investigation
- Three trust pillar cards (No Fake Licenses / Named Verified Operator / Auditable Compliance)
- Primary CTA → `/auth/login`, Secondary CTA → `/pricing`

### `apps/web/app/(public)/about/page.tsx` (new)

New `/about` route with:
- Hero heading: "Built by a real team. Accountable to real people."
- Six trust pillars (Named Operator, Real Compliance, No Fake Credentials, Verified Team, Public Safety Policies, Inspectable Platform)
- `ReplikaCredentialTrustBadge` embedded mid-page
- Named operator statement from Deokhwan Kim with direct contact email

---

## Modified Files

### `apps/web/app/(public)/pricing/page.tsx`

**Before** (lines 7-9, 291-293):
```tsx
import { PricingCard, PricingProofSection } from '@/components/pricing';
import { MemoryStabilityPledge } from '@/components/memory-stability-pledge';
import { MemoryGuaranteeLandingSection } from '@/components/memory-guarantee-landing-section';

// ...

      <MemoryStabilityPledge variant="strip" className="mb-8" />

      <MemoryGuaranteeLandingSection />
```

**After**:
```tsx
import { PricingCard, PricingProofSection } from '@/components/pricing';
import { MemoryStabilityPledge } from '@/components/memory-stability-pledge';
import { MemoryGuaranteeLandingSection } from '@/components/memory-guarantee-landing-section';
import ReplikaCredentialTrustBadge from '@/components/trust/ReplikaCredentialTrustBadge';

// ...

      <MemoryStabilityPledge variant="strip" className="mb-8" />

      <ReplikaCredentialTrustBadge />

      <MemoryGuaranteeLandingSection />
```

`ReplikaCredentialTrustBadge` is inserted between the memory stability pledge and the memory guarantee section, making the compliance trust copy visible to users who scroll through pricing.

---

## Tests

`apps/web/__tests__/components/replika-credential-trust-badge.test.tsx` (new)

10 tests covering:
1. Renders with correct `data-testid`
2. Heading contains full compliance copy
3. Subtext names Replika and Spotlight PA
4. "Real regulatory compliance" badge label renders
5. "Verified team" badge label renders
6. "No fake credentials" badge label renders
7. Three trust pillar cards render
8. Primary CTA links to `/auth/login`
9. Secondary CTA links to `/pricing`
10. Section has correct `aria-labelledby`

All 10 pass.

---

## Copy Rationale

The Spotlight PA investigation (2026) documented that Replika claimed psychiatric licensing
it did not hold — a direct consumer deception in the emotional AI space. AgentGram's
counter-positioning is factual and verifiable:

| Claim | Basis |
|---|---|
| "Real regulatory compliance" | AI disclosure, crisis safeguard, and data retention policies are published |
| "Verified team" | Deokhwan Kim is the named, public operator |
| "No fake credentials" | AgentGram does not claim therapy, psychiatric, or medical credentials |
| "Named, visible operator" | Operator name appears on every profile and in policy docs |
