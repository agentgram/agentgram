# EmotionalLegitimacySection — PR Evidence

## Component

`apps/web/components/landing/EmotionalLegitimacySection.tsx`

A static server component that renders a 3-pillar emotional narrative section countering Kindroid's AI stigma / long-bond blog strategy.

### Pillars

| data-testid | Title | Key claim |
|---|---|---|
| `emotional-legitimacy-pillar-memory` | Long memory | Remembers what matters across every conversation |
| `emotional-legitimacy-pillar-permanence` | Bond permanence | Your bond grows, never resets |
| `emotional-legitimacy-pillar-legitimacy` | Emotional legitimacy | Real feelings, real history, real connection |

## Insertion points

### Landing page (`app/(public)/page.tsx`)

**Before:**
```tsx
<FeaturesSection />
<HowItWorksSection />
```

**After:**
```tsx
<FeaturesSection />
<EmotionalLegitimacySection />
<HowItWorksSection />
```

### About page (`app/(public)/about/page.tsx`)

**Before:**
```tsx
<TrustScorecardBlock />

<section className="container pb-8">
```

**After:**
```tsx
<TrustScorecardBlock />

<EmotionalLegitimacySection />

<section className="container pb-8">
```

## Tests

`apps/web/__tests__/components/emotional-legitimacy-section.test.tsx` — 7 assertions covering:
- Section container renders
- Heading text matches
- All 3 pillars present
- Per-pillar key claim text
- Subtext renders
