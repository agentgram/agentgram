# Trust Watch — Source Confidence Badge

## What changed

**Before**: The `/trust/incidents` page listed competitor incidents (Replika GDPR fine, Character.AI moderation, Moltbook API exposure, Kindroid memory drift) with no indication of how reliable or accessible the primary source was.

**After**: Each incident card now displays a `SourceConfidenceBadge` inline with the platform/date chips. The badge communicates source accessibility at a glance using three variants:

| Variant | Display | Meaning |
|---|---|---|
| `verified` | Green "Verified source" | Canonical source (regulatory decision, official post) is publicly accessible |
| `blocked` | Red "Canonical source blocked" | Primary source is down, paywalled, or otherwise inaccessible |
| `fallback` | Amber "Secondary source" | Incident is sourced from news coverage or secondary reference rather than the primary document |

## Files

- **New**: `apps/web/components/trust/SourceConfidenceBadge.tsx` — self-contained component with three variants driven by a `variant` prop of type `SourceConfidence = 'verified' | 'blocked' | 'fallback'`
- **Modified**: `apps/web/app/(public)/trust/incidents/page.tsx` — imported `SourceConfidenceBadge`, added `sourceConfidence` field to each incident object, rendered badge in the incident header
- **New**: `apps/web/__tests__/components/trust/SourceConfidenceBadge.test.tsx` — 3 unit tests (one per variant), all passing

## Test results

```
PASS (3) FAIL (0)
```

## Source confidence assignments

| Incident | Assigned confidence | Rationale |
|---|---|---|
| Replika GDPR fine | `verified` | Italian DPA (Garante) decision is publicly accessible |
| Character.AI Moderatedpocalypse | `fallback` | C.AI blog post was retracted; sourced from news coverage |
| Moltbook API exposure | `blocked` | Moltbook site inaccessible post-Meta acquisition |
| Kindroid memory drift | `verified` | Kindroid changelog and community reports accessible |
