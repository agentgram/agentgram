'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  type CapabilitySample,
  getCapabilityIcon,
} from '@/lib/capability-sample';
import { VoiceSamplePreview } from '@/components/agents/VoiceSamplePreview';
import { NomiV5ImageParityBadge } from '@/components/agents/NomiV5ImageParityBadge';

export type { CapabilitySample };

interface CapabilitySampleTrayProps {
  capabilities: CapabilitySample[];
  className?: string;
  /** Injected for unit tests. */
  _audioFactory?: (src: string) => HTMLAudioElement;
}

function ImageSamplePreview({
  sampleUrl,
  label,
}: {
  sampleUrl: string;
  label: string;
}) {
  return (
    <div
      className="mt-2 overflow-hidden rounded-xl border border-border/70 bg-muted/30"
      data-testid="image-sample-preview"
    >
      <Image
        src={sampleUrl}
        alt={`${label} sample`}
        width={240}
        height={160}
        className="h-40 w-60 object-cover"
        unoptimized
      />
    </div>
  );
}

export function CapabilitySampleTray({
  capabilities,
  className,
  _audioFactory,
}: CapabilitySampleTrayProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (capabilities.length === 0) {
    return null;
  }

  const hasImageCapability = capabilities.some(
    (cap) => cap.type === 'image' || cap.type === 'selfie'
  );

  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      data-testid="capability-sample-tray"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Capability samples
      </p>
      <div className="flex flex-wrap gap-2">
        {capabilities.map((cap, index) => {
          const icon = getCapabilityIcon(cap.type);
          const isActive = activeIndex === index;
          const hasSample = Boolean(cap.sampleUrl);

          return (
            <div key={`${cap.type}-${index}`} className="flex flex-col gap-1">
              {hasSample ? (
                <button
                  type="button"
                  onClick={() => setActiveIndex(isActive ? null : index)}
                  aria-expanded={isActive}
                  aria-label={`Toggle ${cap.label} sample preview`}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition',
                    isActive
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border/70 bg-background text-foreground/80 hover:border-primary/30 hover:bg-primary/5'
                  )}
                  data-testid={`capability-chip-${cap.type}`}
                >
                  <span aria-hidden="true">{icon}</span>
                  {cap.label}
                  {cap.sampleDuration != null && (
                    <span className="text-[10px] text-muted-foreground">
                      {cap.sampleDuration}s
                    </span>
                  )}
                </button>
              ) : (
                <span
                  className="inline-flex cursor-default items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  data-testid={`capability-chip-${cap.type}`}
                >
                  <span aria-hidden="true">{icon}</span>
                  {cap.label}
                  <span
                    className="text-[10px]"
                    data-testid={`capability-chip-${cap.type}-no-sample`}
                  >
                    샘플 없음
                  </span>
                </span>
              )}

              {isActive && cap.sampleUrl && (
                <div
                  className="ml-1"
                  data-testid={`capability-sample-preview-${cap.type}`}
                >
                  {cap.type === 'voice' ? (
                    <VoiceSamplePreview
                      sampleUrl={cap.sampleUrl}
                      agentName={cap.label}
                      _audioFactory={_audioFactory}
                    />
                  ) : (
                    <ImageSamplePreview
                      sampleUrl={cap.sampleUrl}
                      label={cap.label}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {hasImageCapability && (
        <NomiV5ImageParityBadge className="self-start" />
      )}
    </div>
  );
}

export default CapabilitySampleTray;
