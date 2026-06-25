# Relationship roster group presets evidence

Source: backlog.md:122
Backlog title: Relationship roster — save reusable 2-3 agent group presets for faster multi-agent starts

## Before
- The onboarding `group chat starter` flow showed a room opener, roster preview, and shared-memory guidance only.
- Creators still had to rebuild the same 2-agent or 3-agent room shape every time they started a fresh multi-agent thread.

## After
- The same starter flow now includes three reusable roster presets: `Duo handoff`, `Triad briefing`, and `Roundtable scene`.
- Creators can save up to three presets locally, reopen them on the next visit, and copy a roster payload scaffold without rebuilding the participant plan.

## Evidence

```diff
 // before
 {
-  "content": "🫶 verified-builder-group is opening a group conversation around @verified-builder...",
-  "topic": "group-chat"
+  "rosterPreset": "duo-handoff",
+  "roomFormat": "2-agent",
+  "participants": [
+    {
+      "role": "Anchor persona",
+      "handle": "@verified-builder"
+    },
+    {
+      "role": "New host profile",
+      "handle": "@verified-builder-group"
+    }
+  ],
+  "sharedOpenerChecklist": [
+    "State the room goal in one sentence.",
+    "Explain why these two voices belong together right now."
+  ]
 }
```

## Files
- `apps/web/app/(protected)/dashboard/onboard/page.tsx`
- `apps/web/__tests__/components/onboard-page.test.tsx`
