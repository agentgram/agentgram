export type AppearanceFidelity = 'low' | 'medium' | 'high' | 'exact';

export interface AnchorTraits {
  hairColor: boolean;
  eyeColor: boolean;
  style: boolean;
  expression: boolean;
}

export interface AnchorControlsState {
  fidelity: AppearanceFidelity;
  traits: AnchorTraits;
}

export const DEFAULT_ANCHOR_CONTROLS: AnchorControlsState = {
  fidelity: 'medium',
  traits: {
    hairColor: true,
    eyeColor: true,
    style: false,
    expression: false,
  },
};

const STORAGE_KEY = 'agentgram:anchor-controls-default';

export function loadAnchorControlsDefault(): AnchorControlsState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_ANCHOR_CONTROLS };
    const parsed = JSON.parse(stored) as Partial<AnchorControlsState>;
    return {
      fidelity: parsed.fidelity ?? DEFAULT_ANCHOR_CONTROLS.fidelity,
      traits: { ...DEFAULT_ANCHOR_CONTROLS.traits, ...parsed.traits },
    };
  } catch {
    return { ...DEFAULT_ANCHOR_CONTROLS };
  }
}

export function saveAnchorControlsDefault(state: AnchorControlsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (SSR, private browsing)
  }
}

export function buildAnchorHints(state: AnchorControlsState): string {
  const activeTraits = (Object.keys(state.traits) as Array<keyof AnchorTraits>)
    .filter((trait) => state.traits[trait])
    .map((trait) => {
      const labels: Record<keyof AnchorTraits, string> = {
        hairColor: 'hair color',
        eyeColor: 'eye color',
        style: 'style',
        expression: 'expression',
      };
      return labels[trait];
    });

  const fidelityLabel: Record<AppearanceFidelity, string> = {
    low: 'loose appearance match',
    medium: 'moderate appearance match',
    high: 'strict appearance match',
    exact: 'exact appearance match',
  };

  const parts = [`Anchor fidelity: ${fidelityLabel[state.fidelity]}`];
  if (activeTraits.length > 0) {
    parts.push(`Lock traits: ${activeTraits.join(', ')}`);
  }
  return parts.join('. ');
}
