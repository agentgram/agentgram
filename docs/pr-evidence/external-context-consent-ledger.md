# PR Evidence — External Context Consent Ledger

**Backlog row:** 144 — [STRATEGY] External context transparency sprint

## Before

The `CheckInConsentPanel` showed a simple Allow / Mute prompt with no visibility
into which external data sources the agent had read before generating the outreach.

```
┌─────────────────────────────────────────────┐
│  Allow check-ins from Aria?                 │
│                                             │
│  Your agent may check in with you           │
│  based on your activity.                    │
│                                             │
│  Next possible message: anytime             │
│                                             │
│          [ Mute ]    [ Allow ]              │
└─────────────────────────────────────────────┘
```

Users had no way to know which external context (web links, photos, connected apps,
internet searches) the agent accessed before deciding to reach out.

---

## After

The `CheckInConsentPanel` now renders an `ExternalContextLedger` section (when
`contextSources` prop is supplied) showing exactly what context was read, with a
direct link to `/settings/context-sources` to manage permissions.

```
┌─────────────────────────────────────────────┐
│  Allow check-ins from Aria?                 │
│                                             │
│  Your agent may check in with you           │
│  based on your activity.                    │
│                                             │
│  Next possible message: anytime             │
│                                             │
│  CONTEXT READ BEFORE THIS REPLY  [Manage ↗] │
│  ┌──────────────────────────────────────┐   │
│  │ 🔗 Link  example.com        Jun 9    │   │
│  │    Checked a shared article you sent │   │
│  ├──────────────────────────────────────┤   │
│  │ 🌐 Internet              Jun 9 08:03 │   │
│  │    Searched web for latest news      │   │
│  └──────────────────────────────────────┘   │
│                                             │
│          [ Mute ]    [ Allow ]              │
└─────────────────────────────────────────────┘
```

### ExternalContextLedger standalone (empty state)

```
┌──────────────────────────────────────────────────────────────┐
│ CONTEXT READ BEFORE THIS REPLY        Manage connected sources│
│                                                              │
│  No external context was read.                               │
└──────────────────────────────────────────────────────────────┘
```

### `/settings/context-sources` placeholder page

```
⚙ Connected Context Sources
─────────────────────────────────────────────────
Control which external sources your agent is allowed to read
before sending a proactive message or check-in.

┌──────────────────────────────────────────────────────────────┐
│ Context source types                                         │
│ Each source type below can be individually toggled.          │
│──────────────────────────────────────────────────────────────│
│ 🔗  Links                                    [Coming soon]   │
│     Web URLs shared with your agent...                       │
│──────────────────────────────────────────────────────────────│
│ 🖼  Photos                                   [Coming soon]   │
│     Images you've uploaded...                                │
│──────────────────────────────────────────────────────────────│
│ 🟩  Apps                                     [Coming soon]   │
│     Third-party services connected...                        │
│──────────────────────────────────────────────────────────────│
│ 🌐  Internet                                 [Coming soon]   │
│     Live web searches your agent performs...                 │
└──────────────────────────────────────────────────────────────┘

                        Back to settings
```

---

## Components created / modified

| File | Status |
|---|---|
| `apps/web/components/external-context-ledger.tsx` | New |
| `apps/web/components/external-context-ledger.test.tsx` | New |
| `apps/web/components/agents/CheckInConsentPanel.tsx` | Modified |
| `apps/web/app/settings/context-sources/page.tsx` | New |
| `apps/web/vitest.config.ts` | Modified (added `components/**` include) |
| `docs/pr-evidence/external-context-consent-ledger.md` | New |
