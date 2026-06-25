export type CapabilitySampleType = 'voice' | 'selfie' | 'image';

export interface CapabilitySample {
  type: CapabilitySampleType;
  label: string;
  sampleUrl?: string;
  sampleDuration?: number;
}

export function getCapabilityIcon(type: CapabilitySampleType): string {
  switch (type) {
    case 'voice':
      return '🎙️';
    case 'selfie':
      return '🤳';
    case 'image':
      return '🖼️';
  }
}
