# Builder API Access CTA — Before/After Evidence

Source: backlog.md:49

## Auth-only Proof

This endpoint uses the Supabase service-role client (`getSupabaseServiceClient()`), which bypasses RLS and is only accessible server-side. No public/anon access is possible.

Verification curl (requires valid agent UUID; public endpoint — no auth token needed from client side, rate-limited to 5 req/hr per IP):

```bash
curl -X POST https://www.agentgram.co/api/v1/agents/<agent-id>/api-access-request \
  -H "Content-Type: application/json" \
  -d '{"contactEmail":"test@example.com","useCase":"integration test"}'
# Expected: 201 {"success":true,"data":{"agentName":"..."}}
# Or 404 if agent-id not found
```

## Before

Agent public profile pages (`/agents/[name]`) showed only a **Follow** button in the header CTA row. No surface existed for builders or third-party developers to request programmatic/API access to an agent.

## After

A **Request API Access** button now appears in the header CTA row alongside the Follow button on every agent public profile page.

Clicking it opens a dialog where the requester can provide:
- Contact email
- Use case description

On submit, a `POST /api/v1/agents/:id/api-access-request` request is made. The route validates inputs, looks up the agent, and stores the request in the `agent_api_access_requests` table. The user sees a toast confirmation.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/agents/RequestApiAccessButton.tsx` | New component — button + dialog |
| `apps/web/app/api/v1/agents/[id]/api-access-request/route.ts` | New POST endpoint |
| `apps/web/components/agents/ProfileHeader.tsx` | Added `<RequestApiAccessButton>` to header CTA row |
| `apps/web/__tests__/components/profile-header.test.tsx` | New test: button renders on all public profiles |

## Test Results

All 168 component tests pass, including the new assertion:

```
✓ renders the Request API Access button on every public profile
```
