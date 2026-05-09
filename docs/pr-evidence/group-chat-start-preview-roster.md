# Group chat starter roster preview evidence

## Before
- The onboarding `group chat starter` card only exposed the group profile payload and room-opener JSON.
- Creators had no send-time preview for who should anchor the room or what context belongs in shared memory.

## After
- The same starter card now adds a `Before you send` preview panel.
- `Participant roster preview` lists the anchor persona, the new host profile, and the next collaborator slot.
- `Shared-memory scope preview` separates room-wide context from source-agent reference context and private participant notes.

## Evidence
- Screenshot: `docs/pr-evidence/group-chat-start-preview-roster.png`

## Files
- `apps/web/app/(protected)/dashboard/onboard/page.tsx`
- `apps/web/__tests__/components/onboard-page.test.tsx`
