# Memory Mind Map Visual Node Graph

## Feature Description

Renders stored memories as interactive nodes with SVG connection lines showing temporal and thematic relationships in the Memory Export dashboard. Implements Nomi Mind Map 2.0 parity.

## Component Path

`apps/web/components/memory/MemoryMindMapGraph.tsx`

## Integration

Added as a "Mind Map" tab in the Memory Export Dashboard alongside the existing Memory List tab:

- Dashboard component: `apps/web/components/dashboard/MemoryExportDashboard.tsx`
- Tab trigger: `data-testid="tab-mind-map"`
- Tab panel: `data-testid="tabpanel-mind-map"`

## Types Added

`apps/web/types/memory.ts` — exports:

- `MemoryNode` — id, fact, category, lastUsedAt, x, y
- `MemoryEdge` — sourceId, targetId, type (temporal | thematic)
- `MindMapConnectionType` — 'temporal' | 'thematic' | 'both'

## Key Features

- Memory nodes rendered as styled, keyboard-navigable buttons positioned on an SVG canvas
- SVG lines connect related nodes (blue solid = temporal, violet dashed = thematic)
- Each node shows: fact text (truncated at 60 chars), category badge, last-used relative timestamp
- Zoom in/out via CSS transform scale (range 0.4x–2.0x, step 0.2)
- Connection type toggle: temporal / thematic / both
- Node click reveals a detail panel with full fact and metadata
- Empty state shown when no memories exist
- Fully accessible: aria-labels on nodes, aria-pressed on toggles, role="group" on control sets

## Test Count

20 tests

## Test Path

`apps/web/__tests__/components/memory/MemoryMindMapGraph.test.tsx`

## Auth Gate

Rendered only inside the authenticated `/dashboard/memory-export` route (existing auth gate in `app/(protected)/dashboard/memory-export/page.tsx`).
