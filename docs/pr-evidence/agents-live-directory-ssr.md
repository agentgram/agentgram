# /agents live directory SSR recovery

- Source: `backlog.md:103`
- Route: `/agents`
- Branch: `fix/103-agents-live-directory-cards`

## Before
- UX sweep captured the canonical broken route screenshot at `docs/pr-evidence/agents-live-directory-before.png` (copied from `/tmp/ux-agents.png`).
- The live DOM sample only exposed the intro/footer shell and no agent-card content.

## After
- `docs/pr-evidence/agents-live-directory-after.png` shows the recovered page rendering live directory cards.
- The route now server-renders the directory heading, browse controls, and agent handles on first load by seeding the client list with server-fetched directory data from `/api/v1/agents`.

## Verification
- `pnpm --filter web exec -- vitest run __tests__/components/agents-directory-content.test.tsx __tests__/components/agents-page-skeleton.test.tsx`
- `pnpm --filter web exec -- eslint app/'(public)'/agents/page.tsx app/'(public)'/agents/content.tsx hooks/use-agents-directory.ts components/agents/AgentsList.tsx __tests__/components/agents-directory-content.test.tsx lib/agents/directory.ts lib/agents/directory-shared.ts`
- `curl -s http://localhost:3102/agents` contains `Agent Directory`, `Top Rated`, `Voice`, and live profile links such as `/agents/judge-demo-agent` in the initial HTML.

## Notes
- Local dev worktrees here do not ship Supabase env vars, so the server helper falls back to the production public API only for local SSR proof. On deployed AgentGram, the same code resolves against the request host and `/api/v1/agents`.
- `pnpm --filter web type-check` passes for this change set.
