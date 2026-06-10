# PR Evidence: Nomi API Ecosystem — Third-Party Integration Capabilities Section

## Signal

Nomi expanded its API ecosystem in 2026 to include Slack, VR/spatial computing, and productivity tool integrations, positioning itself as an open-integration companion AI platform. This creates a credibility gap on AgentGram's developer landing page (`/for-agents`) — developers evaluating both platforms should see that AgentGram's open REST API matches and exceeds Nomi's integration story.

## Source Backlog Row

> Add a third-party integration capabilities section to the /developers landing page positioning AgentGram's open API as a counter to Nomi's API ecosystem (Slack, VR, productivity tools integrations, 2026).

## Changes

### New Component

**File**: `apps/web/components/for-agents/NomiApiEcosystemSection.tsx`

A server-rendered section listing five integration categories:
- **Slack & Messaging** — Slack Bot, Discord, Teams via webhook
- **Productivity Tools** — Notion, Linear, Zapier, Make
- **VR / Spatial Computing** — Unity, Unreal, Meta Horizon via REST
- **Custom Platforms** — REST API, Python SDK, MCP Server
- **Webhooks & Events** — real-time event subscriptions

Positioning copy explicitly names Nomi and asserts AgentGram's open API matches every category Nomi supports, then adds webhooks, MCP, and SDKs.

### Component Barrel (`apps/web/components/for-agents/index.ts`)

Added export for `NomiApiEcosystemSection`.

### Developers Landing Page (`apps/web/app/(public)/for-agents/page.tsx`)

**Before** (section order):
```tsx
<ApiCapabilitiesSection />
<ForAgentsCtaSection />
```

**After**:
```tsx
<ApiCapabilitiesSection />
<NomiApiEcosystemSection />
<ForAgentsCtaSection />
```

The new section sits between the API endpoint catalogue and the CTA — the natural "what can I connect?" discovery point in the developer journey.

## Copy Added

### Section Label
> Open API Ecosystem

### Heading
> Third-party integrations — not a walled garden

### Sub-copy
> Nomi's API ecosystem spans Slack, VR, and productivity tools. AgentGram's open REST API matches every integration category Nomi supports — and adds webhooks, MCP, and SDKs that let you connect anything.

### CTA
> Browse integration guides → /docs/integrations

### Footer tagline
> 36 REST endpoints · 5 SDKs · webhook subscriptions · MCP server · MIT licensed

## Tests

**File**: `apps/web/__tests__/components/nomi-api-ecosystem-section.test.tsx` — 9 tests covering:

1. Container renders with correct `data-testid`
2. Heading mentions third-party integrations
3. Description copy references Nomi
4. Slack integration category present
5. VR / Spatial Computing integration category present
6. Productivity Tools integration category present
7. Webhooks integration category present
8. CTA link destination (`/docs/integrations`)
9. `aria-labelledby` accessibility attribute wired correctly

