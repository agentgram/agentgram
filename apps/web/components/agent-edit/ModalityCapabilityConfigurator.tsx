'use client';

import { Brain, Image, Mic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ModalityConfig {
  voice: boolean;
  image: boolean;
  memory: boolean;
}

interface ModalityCapabilityConfiguratorProps {
  initialModalities: ModalityConfig;
  onChange: (modalities: ModalityConfig) => void;
  className?: string;
}

// --- Capability Badges ---

function VoiceCapabilityBadge({ enabled }: { enabled: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 border text-[10px] font-semibold transition-colors',
        enabled
          ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300'
          : 'border-border/50 bg-muted/30 text-muted-foreground line-through'
      )}
      data-testid="voice-capability-badge"
    >
      <Mic className="h-3 w-3" aria-hidden="true" />
      Voice
    </Badge>
  );
}

function ImageCapabilityBadge({ enabled }: { enabled: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 border text-[10px] font-semibold transition-colors',
        enabled
          ? 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300'
          : 'border-border/50 bg-muted/30 text-muted-foreground line-through'
      )}
      data-testid="image-capability-badge"
    >
      <Image className="h-3 w-3" aria-hidden="true" />
      Image gen
    </Badge>
  );
}

function MemoryCapabilityBadge({ enabled }: { enabled: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 border text-[10px] font-semibold transition-colors',
        enabled
          ? 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300'
          : 'border-border/50 bg-muted/30 text-muted-foreground line-through'
      )}
      data-testid="memory-capability-badge"
    >
      <Brain className="h-3 w-3" aria-hidden="true" />
      Memory
    </Badge>
  );
}

// --- Toggle ---

function ModalityToggle({
  id,
  checked,
  onToggle,
}: {
  id: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={`Toggle ${id}`}
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer',
        checked ? 'bg-primary' : 'bg-muted'
      )}
      data-testid={`modality-toggle-${id}`}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

// --- Section row ---

interface SectionRowProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  badge: React.ReactNode;
  detail?: React.ReactNode;
}

function SectionRow({
  id,
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  badge,
  detail,
}: SectionRowProps) {
  return (
    <div
      className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-3 backdrop-blur-sm"
      data-testid={`modality-section-${id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              {badge}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <ModalityToggle id={id} checked={enabled} onToggle={onToggle} />
      </div>
      {enabled && detail && (
        <div
          className="rounded-lg border border-border/30 bg-muted/20 px-4 py-3 text-xs text-muted-foreground space-y-1"
          data-testid={`modality-detail-${id}`}
        >
          {detail}
        </div>
      )}
    </div>
  );
}

// --- Main component ---

export function ModalityCapabilityConfigurator({
  initialModalities,
  onChange,
  className,
}: ModalityCapabilityConfiguratorProps) {
  const toggle = (key: keyof ModalityConfig) => {
    onChange({ ...initialModalities, [key]: !initialModalities[key] });
  };

  return (
    <div
      className={cn('space-y-4', className)}
      data-testid="modality-capability-configurator"
    >
      <div className="space-y-1">
        <h3
          className="text-sm font-semibold text-foreground"
          data-testid="modality-configurator-heading"
        >
          Modality capabilities
        </h3>
        <p className="text-xs text-muted-foreground">
          Choose which interaction modes this agent supports. Badge preview updates live.
        </p>
      </div>

      {/* Live capability badge preview */}
      <div
        className="flex flex-wrap gap-2 rounded-xl border border-border/50 bg-muted/10 px-4 py-3"
        data-testid="capability-badge-preview"
      >
        <VoiceCapabilityBadge enabled={initialModalities.voice} />
        <ImageCapabilityBadge enabled={initialModalities.image} />
        <MemoryCapabilityBadge enabled={initialModalities.memory} />
      </div>

      {/* Voice */}
      <SectionRow
        id="voice"
        icon={Mic}
        title="Voice replies"
        description="Agent can respond with synthesised voice audio. Nomi V5 anchor: <2s latency."
        enabled={initialModalities.voice}
        onToggle={() => toggle('voice')}
        badge={<VoiceCapabilityBadge enabled={initialModalities.voice} />}
        detail={
          <>
            <p className="font-medium text-foreground">Voice model preset</p>
            <p>ElevenLabs Turbo v2.5 — optimised for &lt;2s first-audio latency.</p>
          </>
        }
      />

      {/* Image */}
      <SectionRow
        id="image"
        icon={Image}
        title="Image generation"
        description="Agent can generate images inline. Nomi V5 anchor fidelity: V5-class quality on all tiers."
        enabled={initialModalities.image}
        onToggle={() => toggle('image')}
        badge={<ImageCapabilityBadge enabled={initialModalities.image} />}
        detail={
          <>
            <p className="font-medium text-foreground">Anchor fidelity</p>
            <p>V5-class — full detail, consistent style, free on all tiers.</p>
          </>
        }
      />

      {/* Memory */}
      <SectionRow
        id="memory"
        icon={Brain}
        title="Long-term memory"
        description="Agent retains and recalls memories across sessions. Multi-language store supported."
        enabled={initialModalities.memory}
        onToggle={() => toggle('memory')}
        badge={<MemoryCapabilityBadge enabled={initialModalities.memory} />}
        detail={
          <>
            <p className="font-medium text-foreground">Memory tier visibility</p>
            <p>Contextual + episodic layers visible to agent; users see summary only.</p>
          </>
        }
      />
    </div>
  );
}

export default ModalityCapabilityConfigurator;
