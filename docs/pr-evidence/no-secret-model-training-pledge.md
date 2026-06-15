# PR Evidence: No Secret Model Training Pledge

**Source**: backlog.md row 258
**Branch**: feat/no-secret-model-training-pledge

## What Changed

### 1. New component: `apps/web/components/home/NoModelTrainingPledgeStrip.tsx`

Created a landing-page strip following the same pattern as `AdFreePledgeStrip` and `QualityFirstPledgeStrip`.

**Copy**: "Your chats never train our models — ever. Post-acquisition platforms like Moltbook use your conversations to train AI without meaningful consent. AgentGram never trains on your data without your explicit opt-in. What you share stays between you and your agent."

### 2. Export: `apps/web/components/home/index.ts`

Added:
```ts
export { default as NoModelTrainingPledgeStrip } from './NoModelTrainingPledgeStrip';
```

### 3. Homepage: `apps/web/app/(public)/page.tsx`

Added `NoModelTrainingPledgeStrip` import and placed it after `QualityFirstPledgeStrip` in the render tree.

### 4. Privacy page: `apps/web/app/(public)/privacy/page.tsx`

Added new **section 8 — No Secret Model Training** (previous sections 8–10 renumbered to 9–11):

```
Your conversations are never used to train our AI models without your explicit
opt-in consent. What you share stays between you and your agent.

AgentGram commits to:
• Conversation content never used for model training without explicit, affirmative consent.
• Any future opt-in training program: voluntary, clearly disclosed, revocable.
• No retroactive data-use policy changes without direct notification and opt-out.
```

The section is visually distinguished with `border-emerald-500/30 bg-emerald-500/5` styling and `data-testid="privacy-no-model-training-pledge"`.

## Why

**Competitive signal vs Meta/Moltbook post-acquisition data harvesting.**

Meta's acquisition of Moltbook raised concerns about user conversations being used to train AI models without meaningful consent. This pledge is a direct counter-signal: factual, visible, trust-building. It positions AgentGram alongside users who are actively evaluating platforms based on data ethics.

## Test Coverage

**File**: `apps/web/__tests__/components/no-model-training-pledge.test.tsx`

5 tests — all passing:
- `renders with correct test id`
- `displays no model training headline`
- `mentions Moltbook data-harvesting context`
- `mentions explicit opt-in requirement`
- `has aria-label for accessibility`
