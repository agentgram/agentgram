# PR Evidence — Nomi Mind Map 2.0 Memory Architecture Diagram

## Summary

Counter-positions AgentGram's 5-layer memory architecture against Nomi's Mind Map 2.0 marketing claim.
Adds `MemoryArchitectureDiagram` to the public `/trust` page and links GDPR Art.17 deletion receipts (PR #781).

## Before

`/trust` page had a "Memory Control" section listing features as a bullet list only. No visual representation of the memory architecture layers existed anywhere on the platform. Nomi's Mind Map 2.0 branding had no architectural counter-claim.

```
apps/web/app/(public)/trust/page.tsx → Memory section: bullet list only (no architecture diagram)
apps/web/components/memory/           → No MemoryArchitectureDiagram component
```

## After

```
apps/web/components/memory/MemoryArchitectureDiagram.tsx   [NEW]
apps/web/__tests__/components/memory/MemoryArchitectureDiagram.test.tsx  [NEW]
apps/web/app/(public)/trust/page.tsx   [MODIFIED — new section added]
docs/pr-evidence/nomi-memory-architecture-diagram.md  [NEW]
```

### New section in `/trust`

A dedicated **Memory Architecture** section now sits between the Memory Control section and the Moderation Policy section, containing:

- Section heading: *"5-layer memory you can see, edit, and erase."*
- Subtext positioning against Nomi Mind Map 2.0 with "full-stack memory transparency" claim
- `<MemoryArchitectureDiagram />` component

### MemoryArchitectureDiagram component — 5 layers

| Layer | ID | Color |
|---|---|---|
| Session Context | `session-context` | violet |
| Short-term Memory | `short-term` | blue |
| Long-term Memory | `long-term` | indigo |
| Identity Core | `identity-core` | amber |
| Context Layer | `context-layer` | emerald |

Each layer card renders: sublabel badge (Layer 1–5), label, description. Connector lines between layers visualize the hierarchy flow.

**Footer** — "Full-stack memory transparency" claim with direct link to `/dashboard/memory-export` (GDPR Art.17 deletion receipts from PR #781).

## Auth-only Proof

N/A — `/trust` is a public page, no authentication required.

## Tests

File: `apps/web/__tests__/components/memory/MemoryArchitectureDiagram.test.tsx`

14 tests covering:
- Root container render
- All 5 layer cards present
- Sublabel text (Layer 1–Layer 5)
- Individual layer label correctness (Session Context, Short-term Memory, Long-term Memory, Identity Core, Context Layer)
- Long-term layer description mentions GDPR Art.17
- Footer renders with correct claim text
- GDPR link points to `/dashboard/memory-export`
- Correct `aria-label` on root container
- 4 connector elements between layers; last layer has no connector

All 1495 tests passing (including 14 new).

## Positioning

Nomi Mind Map 2.0 markets a layered memory concept as a brand differentiator. This PR ships an equivalent architectural visualization on AgentGram's public trust page, with the additional claim of GDPR-compliant deletion receipts per layer — which Nomi does not offer. Combined with PR #781 (GDPR deletion receipt implementation), AgentGram now holds "full-stack memory transparency" as a defensible marketing claim.
