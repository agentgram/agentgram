'use client';

import { useState } from 'react';
import { Anchor, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnchorControlsState, AppearanceFidelity } from '@/lib/image-gen/anchor-controls';
import {
  DEFAULT_ANCHOR_CONTROLS,
  saveAnchorControlsDefault,
} from '@/lib/image-gen/anchor-controls';

const FIDELITY_OPTIONS: { value: AppearanceFidelity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'exact', label: 'Exact match' },
];

const TRAIT_LABELS: Record<keyof AnchorControlsState['traits'], string> = {
  hairColor: 'Hair color',
  eyeColor: 'Eye color',
  style: 'Style',
  expression: 'Expression',
};

interface AnchorControlsPresetProps {
  initialValue?: AnchorControlsState;
  onChange?: (state: AnchorControlsState) => void;
}

export function AnchorControlsPreset({
  initialValue,
  onChange,
}: AnchorControlsPresetProps) {
  const [state, setState] = useState<AnchorControlsState>(
    initialValue ?? DEFAULT_ANCHOR_CONTROLS
  );
  const [savedDefault, setSavedDefault] = useState(false);

  function update(next: AnchorControlsState) {
    setState(next);
    onChange?.(next);
    setSavedDefault(false);
  }

  function handleFidelityChange(fidelity: AppearanceFidelity) {
    update({ ...state, fidelity });
  }

  function handleTraitToggle(trait: keyof AnchorControlsState['traits']) {
    update({
      ...state,
      traits: { ...state.traits, [trait]: !state.traits[trait] },
    });
  }

  function handleSaveDefault() {
    saveAnchorControlsDefault(state);
    setSavedDefault(true);
  }

  return (
    <div
      className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-4"
      data-testid="anchor-controls-preset"
    >
      <div className="flex items-center gap-2">
        <Anchor className="h-4 w-4 text-primary" aria-hidden="true" />
        <p
          className="text-sm font-semibold"
          data-testid="anchor-controls-title"
        >
          Anchor Controls
        </p>
        <span className="ml-auto text-xs text-muted-foreground">
          Nomi V5 appearance fidelity
        </span>
      </div>

      <fieldset>
        <legend className="text-xs font-medium text-muted-foreground mb-2">
          Appearance fidelity
        </legend>
        <div
          className="flex flex-wrap gap-2"
          data-testid="anchor-controls-fidelity-group"
        >
          {FIDELITY_OPTIONS.map(({ value: opt, label }) => (
            <label
              key={opt}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                state.fidelity === opt
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border/60 bg-background text-muted-foreground hover:border-primary/40'
              }`}
            >
              <input
                type="radio"
                name="anchor-fidelity"
                value={opt}
                checked={state.fidelity === opt}
                onChange={() => handleFidelityChange(opt)}
                className="sr-only"
                data-testid={`anchor-controls-fidelity-${opt}`}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-medium text-muted-foreground mb-2">
          Lock appearance traits
        </legend>
        <div
          className="flex flex-wrap gap-3"
          data-testid="anchor-controls-traits"
        >
          {(
            Object.keys(TRAIT_LABELS) as Array<keyof typeof TRAIT_LABELS>
          ).map((trait) => (
            <label
              key={trait}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={state.traits[trait]}
                onChange={() => handleTraitToggle(trait)}
                className="h-4 w-4 rounded border-input accent-primary"
                data-testid={`anchor-controls-trait-${trait}`}
              />
              <span>{TRAIT_LABELS[trait]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Controls how closely generated images match the anchor appearance.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSaveDefault}
          data-testid="anchor-controls-save-default"
          className="gap-1.5 text-xs"
        >
          <Save className="h-3.5 w-3.5" />
          {savedDefault ? 'Saved!' : 'Save as default'}
        </Button>
      </div>
    </div>
  );
}
