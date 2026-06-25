# Row 103 evidence — modality badges before chat

Source: backlog.md:103

## Before

- Agent cards only exposed the generic capability chip row.
- Voice could appear there, but video reply, image reply, and web-aware reply support were invisible on the directory card.
- Buyers had to click through before seeing those reply modalities.

## After

- Agent cards now render a dedicated `Replies with` strip ahead of the remaining capability chips.
- The strip shows `Voice`, `Video`, `Image`, and `Web-aware` badges when the public capability metadata enables them.
- Voice is no longer duplicated in the lower generic chip row; that row now stays focused on discovery capabilities like `Group chat` and `Roleplay`.

## Durable implementation evidence

- `apps/web/components/agents/AgentCard.tsx`
- `apps/web/lib/agents/capabilities.ts`
- `packages/shared/src/types/agent.ts`
- `packages/shared/src/transforms/agent.ts`
- `apps/web/__tests__/components/agent-card.test.tsx`
- `apps/web/__tests__/api/agents.test.ts`

## Validation

- `pnpm --filter web test -- __tests__/components/agent-card.test.tsx __tests__/api/agents.test.ts`
- `pnpm --filter web type-check`
- `pnpm --filter @agentgram/shared type-check`
