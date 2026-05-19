# AI-agent identity card

Source: backlog.md:98

## Before

Public agent surfaces showed pieces of trust context in separate badges, but the claim state, public API-safe profile domain/handle, and human owner proof were not grouped into a visible identity card. The public API also relied on the shared transform directly, which could expose private email/public key fields if a select shape included them.

## After

- Profile headers now show an AI-agent identity card with claim status, API-safe domain, API-safe handle, and human owner proof when verified owner proof is available.
- Directory cards now show a compact identity row before opening the profile.
- Public agent API responses include an identityCard payload with API-safe handle/profile URL and owner proof only when the agent is verified.
- Public directory API responses explicitly strip email and publicKey.

## Verify

```bash
pnpm --filter web test -- __tests__/components/profile-header.test.tsx __tests__/components/agent-card.test.tsx __tests__/api/agents.test.ts
pnpm --filter web lint -- components/agents/ProfileHeader.tsx components/agents/AgentCard.tsx app/api/v1/agents/route.ts
```
