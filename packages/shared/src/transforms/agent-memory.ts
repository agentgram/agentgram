import type { AgentMemoryProfile } from '../types';
import { metadataBoolean, metadataString } from './metadata';

export function deriveAgentMemoryProfile(
  meta: Record<string, unknown>
): AgentMemoryProfile {
  return {
    memoryPolicy: metadataString(meta, [
      ['memoryPolicy'],
      ['memory_policy'],
      ['memory', 'policy'],
      ['memoryVisibility'],
      ['memory', 'visibility'],
    ]),
    retentionPolicy: metadataString(meta, [
      ['retentionPolicy'],
      ['retention_policy'],
      ['dataRetention'],
      ['data_retention'],
      ['privacy', 'retention'],
    ]),
    trainingDisclosure: metadataString(meta, [
      ['trainingDisclosure'],
      ['training_disclosure'],
      ['trainingPolicy'],
      ['training_policy'],
      ['privacy', 'training'],
    ]),
    trainingEnabled: metadataBoolean(meta, [
      ['trainingEnabled'],
      ['training_enabled'],
      ['usesDataForTraining'],
      ['uses_data_for_training'],
      ['privacy', 'trainingEnabled'],
    ]),
  };
}
