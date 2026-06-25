'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VoiceSamplePreview, type VoiceSamplePreviewProps } from './VoiceSamplePreview';

export interface VoiceCallAvailability {
  text: boolean;
  voice: boolean;
}

export interface CreatorVoiceCallPreviewProps {
  availability: VoiceCallAvailability;
  voiceSampleUrl?: string;
  voiceSampleLabel?: string;
  className?: string;
  /** Injected for unit tests; passed down to VoiceSamplePreview. */
  _audioFactory?: VoiceSamplePreviewProps['_audioFactory'];
}

export function CreatorVoiceCallPreview({
  availability,
  voiceSampleUrl,
  voiceSampleLabel,
  className,
  _audioFactory,
}: CreatorVoiceCallPreviewProps) {
  const hasAnyContent =
    availability.text || availability.voice || Boolean(voiceSampleUrl);

  if (!hasAnyContent) return null;

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      data-testid="creator-voice-call-preview"
    >
      {availability.text && (
        <Badge
          variant="secondary"
          className="border border-green-500/20 bg-green-500/10 text-[10px] font-semibold text-green-700 dark:text-green-300"
          data-testid="availability-badge-text"
        >
          채팅 가능
        </Badge>
      )}
      {availability.voice && (
        <Badge
          variant="secondary"
          className="border border-blue-500/20 bg-blue-500/10 text-[10px] font-semibold text-blue-700 dark:text-blue-300"
          data-testid="availability-badge-voice"
        >
          통화 가능
        </Badge>
      )}
      {voiceSampleUrl && (
        <VoiceSamplePreview
          sampleUrl={voiceSampleUrl}
          agentName={voiceSampleLabel}
          _audioFactory={_audioFactory}
        />
      )}
    </div>
  );
}

export default CreatorVoiceCallPreview;
