# MemoryRetrievalModeSelector — Component API and Integration Guide

## Overview

`MemoryRetrievalModeSelector` is a segmented control that lets users choose how memories are weighted during retrieval. It extends PR #838 (memory retrieval basis display) by giving users agency over the retrieval strategy rather than only showing transparency into the system's choices.

## Component API

```tsx
import { MemoryRetrievalModeSelector, type RetrievalMode } from '@/components/memory/MemoryRetrievalModeSelector';

<MemoryRetrievalModeSelector
  value={retrievalMode}      // 'recency' | 'relevance' | 'diversity'
  onChange={setRetrievalMode} // (mode: RetrievalMode) => void
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `'recency' \| 'relevance' \| 'diversity'` | Currently selected retrieval mode |
| `onChange` | `(mode: RetrievalMode) => void` | Called when user selects a different mode |

### Modes

| Mode | Icon | Description |
|------|------|-------------|
| `recency` | Clock | Prioritize recent memories |
| `relevance` | Crosshair | Prioritize contextually relevant memories (default) |
| `diversity` | Shuffle | Balance across different memory types |

## Integration

The selector is wired into `MemoryTransparencyPanel` (`apps/web/components/dashboard/MemoryTransparencyPanel.tsx`) above the memory list. It defaults to `'relevance'`.

A `TODO` comment marks where the selected mode should be:
1. Persisted to the user preferences API
2. Passed to the retrieval backend as a query parameter or request body field

## Future Work

- Connect `onChange` to `PATCH /api/v1/user/preferences` with `{ memory_retrieval_mode: mode }`
- Pass `retrievalMode` to the memory fetch call so the backend can apply the selected weighting
- Show a tooltip or inline description of each mode for first-time users
