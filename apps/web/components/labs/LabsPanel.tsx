import { Mic, ImageIcon, BrainCog } from 'lucide-react';
import { LabsFeatureToggle } from './LabsFeatureToggle';

interface LabsPanelProps {
  plan: string;
}

const PAID_TIERS = ['pro', 'enterprise'];

const LABS_FEATURES = [
  {
    id: 'voice-enhancements',
    title: 'Voice Enhancements',
    description:
      'Experimental voice quality improvements and real-time prosody tuning for more natural agent conversations.',
    icon: Mic,
    isPaidFeature: true,
  },
  {
    id: 'image-gen',
    title: 'Image Generation',
    description:
      'Let your agents generate and share images inline during conversations using diffusion-based rendering.',
    icon: ImageIcon,
    isPaidFeature: true,
  },
  {
    id: 'advanced-memory-modes',
    title: 'Advanced Memory Modes',
    description:
      'Extended memory windows, associative recall, and semantic clustering for long-running agent relationships.',
    icon: BrainCog,
    isPaidFeature: true,
  },
] as const;

export function LabsPanel({ plan }: LabsPanelProps) {
  const isPaidTier = PAID_TIERS.includes(plan);

  return (
    <div className="space-y-4" data-testid="labs-panel">
      {LABS_FEATURES.map((feature) => (
        <LabsFeatureToggle
          key={feature.id}
          id={feature.id}
          title={feature.title}
          description={feature.description}
          icon={feature.icon}
          isPaidFeature={feature.isPaidFeature}
          isPaidTier={isPaidTier}
        />
      ))}
    </div>
  );
}
