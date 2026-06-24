# PR Evidence — Modality Capability Configurator (row 362)

## Before / After

**Before:** The agent edit flow had no way for builders to control which interaction modalities (voice, image, memory) an agent supports. There was no preview of resulting capability badges before publish.

**After:** A `ModalityCapabilityConfigurator` panel is available in `apps/web/components/agent-edit/`. Builders toggle voice, image, and memory availability. A live badge preview row updates immediately as toggles change. Each enabled modality expands to show a configuration detail panel (voice model preset, image anchor fidelity, memory tier visibility). The component is a controlled, stateless UI leaf — the parent page owns the state via `onChange`.

## Component Props API

```ts
interface ModalityConfig {
  voice: boolean;
  image: boolean;
  memory: boolean;
}

interface ModalityCapabilityConfiguratorProps {
  initialModalities: ModalityConfig;   // current modality state owned by parent
  onChange: (modalities: ModalityConfig) => void; // called with full updated config on any toggle
  className?: string;
}
```

### Key sub-components (internal)
| Component | `data-testid` | Purpose |
|---|---|---|
| VoiceCapabilityBadge | `voice-capability-badge` | Badge preview; green when enabled, muted+strikethrough when off |
| ImageCapabilityBadge | `image-capability-badge` | Badge preview; violet when enabled |
| MemoryCapabilityBadge | `memory-capability-badge` | Badge preview; blue when enabled |
| ModalityToggle | `modality-toggle-{id}` | role=switch toggle for each modality |
| SectionRow | `modality-section-{id}` | Row container per modality |
| Detail panel | `modality-detail-{id}` | Visible only when modality is enabled |

## Test Coverage Summary

File: `apps/web/__tests__/components/agent-edit/ModalityCapabilityConfigurator.test.tsx`

| # | Test | Assertion |
|---|---|---|
| 1 | Renders container and heading | `data-testid` present, heading text matches |
| 2 | Renders capability badge preview with all three badges | All 3 badge testids present in preview row |
| 3 | Renders all three section rows | voice/image/memory section testids present |
| 4 | All-enabled → toggles aria-checked=true | aria-checked attribute on each toggle |
| 5 | All-disabled → toggles aria-checked=false | aria-checked attribute on each toggle |
| 6 | Voice toggle click → onChange with voice flipped | vi.fn() spy on onChange |
| 7 | Image toggle click → onChange with image flipped | vi.fn() spy on onChange |
| 8 | Memory toggle click → onChange with memory flipped | vi.fn() spy on onChange |
| 9 | Detail panel visible for enabled modality, hidden for disabled | queryByTestId null check |
