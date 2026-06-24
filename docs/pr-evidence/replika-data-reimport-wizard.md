# Replika Data Re-Import Wizard — PR Evidence

**Backlog row**: 201  
**Route**: `/migrate`  
**Component**: `ReplikaReimportWizard`

---

## Before

No migration guide existed. Users displaced by the Replika 2.0 amnesia wave had no structured
onboarding path to move their companion data to AgentGram. There was no `/migrate` route, no
step-by-step export instructions, and no upload UI.

## After

A new public page at `/migrate` guides Replika users through a 4-step wizard:

| Step | Title | What it does |
|------|-------|-------------|
| 1 | Export from Replika | Step-by-step instructions to export `replika_memories.json` and `conversation_history.csv` from the Replika mobile app |
| 2 | Create your AgentGram account | Signup CTA with a benefits list emphasising the memory guarantee |
| 3 | Upload your data | File dropzone accepting `.json`, `.csv`, and `.zip`; privacy note explaining on-device processing |
| 4 | Your memories are safe | Success card + CTAs to the memory editor and agent creation flow |

A **"Why migrate?"** section below the wizard explains:
- The Replika 2.0 amnesia wave (early 2026 silent memory wipes)
- AgentGram's binding memory guarantee
- Full data portability / no lock-in

---

## Files added

| Path | Description |
|------|-------------|
| `apps/web/app/(public)/migrate/page.tsx` | Next.js page with metadata and hero section |
| `apps/web/components/replika-reimport-wizard.tsx` | `ReplikaReimportWizard` component — wizard + why-migrate section |
| `apps/web/__tests__/components/replika-reimport-wizard.test.tsx` | 29 unit tests covering all steps, navigation, CTAs, and why-migrate content |
| `docs/pr-evidence/replika-data-reimport-wizard.md` | This file |

---

## Test coverage

29 tests covering:
- Wizard renders and step navigation
- Each step panel renders correct content
- Back/next button enable/disable logic
- Direct step selection via nav buttons
- Export file format mentions
- Account benefits list and signup CTA href
- Upload dropzone accepted formats
- Confirm step success card and next-step links
- Why-migrate section with all three cards
- Memory guarantee link

All tests pass under `pnpm test` in `apps/web`.
