# PR Evidence: Image+Memory Pre-Generation Combined Setup Guide

## Backlog Row
Row 339 — Image+memory pre-generation combined guide

## Context
Extends PR #833 (avatar quality pre-flight) and PR #791 (memory anchor). Instead of users setting
memory context and image quality in separate parts of the UI, this guide walks them through both
in a single focused flow before triggering generation.

## Changes

### New Component

**`apps/web/components/common/PreGenerationSetupGuide.tsx`**

A 3-step Dialog modal that bundles memory anchor context and quality/style pre-flight into one flow.

#### Props

```tsx
interface PreGenerationSetupGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (config: PreGenerationConfig) => void;
  onCancel: () => void;
}

interface PreGenerationConfig {
  memoryContext: string;   // character traits / style notes embedded in the prompt
  quality: 'standard' | 'hd';
  style: 'Photorealistic' | 'Illustrated' | 'Pixel Art';
}
```

#### Step flow

| Step | Title | Content |
|------|-------|---------|
| 1 | Memory Context | Textarea for character traits, style notes, scene context to embed in the image prompt. Blank = no anchor. |
| 2 | Quality Pre-flight | Quality tier radio (Standard / HD) + style pills (Photorealistic / Illustrated / Pixel Art). |
| 3 | Generate | Read-only summary of memory context + quality + style, plus "Generate Image" CTA. |

#### Data test IDs

- `pre-generation-setup-guide` — Dialog root
- `pre-gen-step-indicator-{1,2,3}` — step circles in the progress indicator
- `pre-gen-title`, `pre-gen-description` — current step heading/subtitle
- `pre-gen-step-memory` — step 1 content
- `pre-gen-memory-textarea` — memory context textarea
- `pre-gen-step-quality` — step 2 content
- `pre-gen-quality-group` — quality radio group container
- `pre-gen-quality-standard`, `pre-gen-quality-hd` — individual quality radios
- `pre-gen-style-group` — style pills container
- `pre-gen-style-photorealistic`, `pre-gen-style-illustrated`, `pre-gen-style-pixel-art` — style radios
- `pre-gen-step-summary` — step 3 content
- `pre-gen-summary-memory` — memory context summary block
- `pre-gen-summary-settings` — quality+style summary block
- `pre-gen-cancel-btn`, `pre-gen-back-btn`, `pre-gen-next-btn`, `pre-gen-generate-btn` — navigation buttons

### Edited Files

**`apps/web/components/common/index.ts`**
- Added exports for `PreGenerationSetupGuide`, `PreGenerationConfig`, `ImageQuality`, `ImageStyle`

## Usage Example

```tsx
import { useState } from 'react';
import { PreGenerationSetupGuide } from '@/components/common';

export function ImageGenTrigger() {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <>
      <button onClick={() => setGuideOpen(true)}>
        Setup before generating
      </button>

      <PreGenerationSetupGuide
        open={guideOpen}
        onOpenChange={setGuideOpen}
        onComplete={(config) => {
          // config.memoryContext, config.quality, config.style
          startGeneration(config);
        }}
        onCancel={() => setGuideOpen(false)}
      />
    </>
  );
}
```

## UX Flow: Before → After

**Before:**  
Memory anchor and image quality/style were set in different parts of the UI with no guided path
linking them. Users had to know to configure both before generating.

**After:**  
A single 3-step modal walks the user through (1) memory context, (2) quality+style pre-flight,
(3) summary confirmation — then hands a typed `PreGenerationConfig` to the caller to trigger
generation. The guide resets to step 1 on close, so each generation session starts fresh.
