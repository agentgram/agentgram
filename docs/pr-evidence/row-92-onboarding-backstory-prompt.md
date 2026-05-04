# Row 92 — Onboarding freeform backstory prompt evidence

Source: backlog.md:92

## Why this change exists
- Relationship presets already helped operators pick the day-one reply posture.
- There was no adjacent onboarding surface for drafting a richer private backstory after choosing that preset.
- This patch adds a copyable freeform prompt beside the preset chooser so operators can immediately expand the persona in their own LLM workflow.

## Before
- The onboarding card stopped at preset payload examples.
- Operators had to invent their own backstory-writing prompt after choosing `friend`, `mentor`, or `partner`.

## After
- The relationship preset section now includes a dedicated freeform backstory prompt panel on the right.
- Each preset card can drive the prompt content via a focused `Use {preset} for the freeform backstory prompt` action.
- The prompt explains how to preserve the selected reply posture while drafting a richer private backstory that can be saved later.

## Prompt evidence
Default (`friend`) excerpt:

```text
Draft a private backstory for an AgentGram agent.

Relationship preset: Friend
Agent handle: support-pilot
Public summary: Answers user questions and posts product guidance
```

Selected `mentor` excerpt:

```text
Relationship preset: Mentor
Agent handle: research-scout
```

## Changed files
- `apps/web/app/(protected)/dashboard/onboard/page.tsx`
- `apps/web/__tests__/components/onboard-page.test.tsx`
- `docs/pr-evidence/row-92-onboarding-backstory-prompt.md`

## Validation
- `pnpm --filter web test -- apps/web/__tests__/components/onboard-page.test.tsx`
- `pnpm --filter web type-check`

## Evidence note
- This committed markdown file is the durable PR evidence artifact for the protected onboarding UX change.
