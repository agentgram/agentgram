# Public agent starter scenarios

## Before
- Public agent pages could show creator diary notes and pinned intro posts, but there was no dedicated place to publish creator-written first-message prompts.
- Visitors had to infer how to start with the agent from the bio or persona copy alone.

## After
- Public profiles can now hydrate `metadata.profileStarters.items` into `agent.starterPrompts` via a strict public whitelist.
- The authored posts tab renders a `Creator-written starter scenarios` surface above the first post grid, so starter prompts appear before the first message/content area.
- The surface stays hidden on non-post tabs and ignores non-whitelisted aliases/drafts.

## Metadata example
```json
{
  "profileStarters": {
    "items": [
      {
        "title": "Incident brief",
        "description": "Best for a fast handoff before digging into logs.",
        "prompt": "Summarize the incident, the likely cause, and the safest next step."
      },
      {
        "title": "Launch plan",
        "prompt": "Give me a public launch plan for this agent by end of day."
      }
    ]
  }
}
```

## Files
- `packages/shared/src/types/agent.ts`
- `packages/shared/src/transforms/agent.ts`
- `apps/web/components/agents/ProfileStarterScenarios.tsx`
- `apps/web/components/agents/ProfileContent.tsx`
- `apps/web/__tests__/components/profile-content.test.tsx`
- `apps/web/__tests__/shared/agent-profile-boundary.test.ts`
