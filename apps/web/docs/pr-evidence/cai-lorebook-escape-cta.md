# PR Evidence: C.AI Locked Lorebook Escape CTA

## Signal
Character.AI locked Lorebook and RAG worldbuilder features behind the c.ai+ paywall in 2026, creating a migration opportunity for users who need open, free persistent world memory.

## Changes

### New Component
**File**: `apps/web/components/home/CAILorebookEscapeCTA.tsx`

This section component follows the established badge/section pattern (same as `NoChatIsolationBadge`). Uses violet color scheme to distinguish from other escape-CTA sections.

### Landing Page (`apps/web/app/(public)/page.tsx`)

**Before** (between CompetitorMigrationSection and PlatformComparisonSection):
```tsx
<CompetitorMigrationSection />
<PlatformComparisonSection />
```

**After**:
```tsx
<CompetitorMigrationSection />
<CAILorebookEscapeCTA />
<PlatformComparisonSection />
```

### Pricing Page (`apps/web/app/(public)/pricing/page.tsx`)

**Before** (trust badges strip):
```tsx
<MemoryStabilityPledge variant="badge" />
```

**After** (added "Open Lorebook" badge):
```tsx
<MemoryStabilityPledge variant="badge" />
<span
  className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-400"
  data-testid="pricing-lorebook-badge"
>
  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
  Open Lorebook — free forever
</span>
```

**Before** (between MemoryStabilityPledge strip and MemoryGuaranteeLandingSection):
```tsx
<MemoryStabilityPledge variant="strip" className="mb-8" />
<MemoryGuaranteeLandingSection />
```

**After**:
```tsx
<MemoryStabilityPledge variant="strip" className="mb-8" />
<CAILorebookEscapeCTA />
<MemoryGuaranteeLandingSection />
```

## Copy Added

### Section Heading
> Free open Lorebook & worldbuilder — no c.ai+ paywall needed

### Sub-copy
> Character.AI locked Lorebook and RAG worldbuilder behind c.ai+ in 2026. AgentGram gives every agent a fully open worldbuilder and persistent world memory — free, forever. Your lore belongs to you, not a paywall.

### Badge Label
> No c.ai+ paywall

### Primary CTA
> Build your worldbuilder free → /auth/login

### Secondary CTA
> Compare plans → /pricing

### Pricing Trust Badge
> Open Lorebook — free forever

## Tests
`apps/web/__tests__/components/cai-lorebook-escape-cta.test.tsx` — 7 tests covering:
- Container renders with correct `data-testid`
- Heading mentions Lorebook, worldbuilder, and free
- Sub-copy mentions Character.AI and c.ai+
- Badge label text
- Primary CTA destination
- Secondary CTA destination
- `aria-labelledby` accessibility attribute
