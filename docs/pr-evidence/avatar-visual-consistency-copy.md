# PR Evidence — Avatar Visual Consistency Guarantee Copy

**Source:** backlog.md:267  
**Signal:** Nomi App Store 2026 — avatar rendering inconsistency is the #1 complaint (4.6★, 5K+ reviews)

## Problem (Before)

Nomi users frequently report that their companion's appearance changes unexpectedly between sessions:
- Hair color shifts from session to session
- Eye color inconsistency ("specified violet eyes, gets brown ones")
- Style/outfit ignores the configured persona details

AgentGram had no explicit copy addressing this pain point, leaving a differentiation gap visible to users migrating from Nomi.

## Solution (After)

### New Component: `AvatarConsistencyGuaranteeStrip`

File: `apps/web/components/avatar-consistency-guarantee.tsx`

**Badge variant** — inline trust pill used on agent profile cards (ProofStrip):
> "Persona always renders as designed"

**Strip variant** — full-width section banner used on /pricing:
> "Your persona always looks exactly as designed — guaranteed. Nomi's #1 App Store complaint in 2026 is avatar rendering inconsistency. AgentGram locks every visual detail at creation: no rendering drift, no surprise look changes between sessions."

### New Component: `AvatarConsistencyComparisonGallery`

Illustrative comparison table (text-based, no external image dependencies):

| Attribute | Others (Nomi 2026) | AgentGram |
|-----------|-------------------|-----------|
| Hair color | Randomly blonde or black | Auburn, shoulder-length — every time |
| Eye color | Green or brown depending on session | Violet — locked at creation |
| Style | Formal suit, different each render | Casual style preserved across sessions |

### Integration Points

1. **Agent profile pages** (`ProofStrip.tsx`) — badge appended to the identity proof strip shown on every agent profile card
2. **Pricing page** (`/pricing/page.tsx`) — three additions:
   - Badge in the hero trust-badge cluster
   - Full feature section block (card layout, matching multilingual / Nomi V5 sections)
   - Full-width strip banner (above FreeToStartStrip)
   - Comparison gallery (after MemoryGuaranteeLandingSection)

## Test Coverage

File: `apps/web/__tests__/components/avatar-consistency-guarantee.test.tsx`

- 12 tests across `AvatarConsistencyGuaranteeStrip` (badge + strip variants) and `AvatarConsistencyComparisonGallery`
- All 1385 suite tests pass after change

## Copy Framing

Deliberately mirrors the multilingual memory badge pattern (PR #774) — same Nomi 4.6★ / 5K+ reviews source, same counter-positioning strategy. Allows pricing page to present a consistent "we solved Nomi's top complaints" narrative.
