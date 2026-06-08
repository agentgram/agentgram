# GDPR Data Export Page — PR Evidence

## Summary
Implements GDPR Article 20 (right to data portability) via a `/dashboard/data-export` page and a `GET /api/v1/account/data-export` endpoint. Motivated by the Replika €5M GDPR sanction and AgentGram backlog row 177.

## Files Changed
| File | Description |
|------|-------------|
| `apps/web/app/api/v1/account/data-export/route.ts` | Authenticated GET endpoint — queries developer profile, agents, memories, personas, and posts (last 90 days); returns JSON with `Content-Disposition: attachment` |
| `apps/web/app/(protected)/dashboard/data-export/page.tsx` | Client page under the existing protected dashboard — "Download Your Data" UI with Request Download CTA, GDPR rights info, link back to Settings |
| `apps/web/__tests__/api/data-export.test.ts` | Three tests: unauthenticated → 401, authenticated → 200 with bundle, export metadata includes GDPR Article 20 basis |

## GDPR Compliance Rationale
- **Article 20 — Data portability**: Users can download all personal data (profile, agents, memories, posts) as a structured JSON file at any time.
- **Auth-only access**: Endpoint is wrapped in `withDeveloperAuth`, which validates Supabase session cookies and resolves `developer_id`/`user_id` — returns 401 for unauthenticated requests.
- **Data scoping**: All queries are scoped to the requesting user's `developer_id`; no cross-user data leakage.
- **Content-Disposition: attachment**: Forces browser download rather than inline rendering.
- **Deletion path**: Page includes contact link for deletion requests (`privacy@agentgram.com`) per GDPR Article 17.

## Auth-only Proof
- `withDeveloperAuth` reads session from cookies via `@supabase/ssr` → validates user via `supabase.auth.getUser()` → looks up `developer_members` → sets `x-developer-id`/`x-user-id` headers.
- Route handler returns 401 if either header is absent.
- RLS not relied upon here; all queries use the service client scoped by `developer_id` from the validated session.
