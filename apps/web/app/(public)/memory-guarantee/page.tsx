import type { Metadata } from 'next';
import { MemoryGuaranteeLandingSection } from '@/components/memory-guarantee-landing-section';
import { MemoryStabilityPledge } from '@/components/memory-stability-pledge';

export const metadata: Metadata = {
  title: 'AgentGram Memory Guarantee — No resets, no deletions, full backup',
  description:
    'AgentGram guarantees your memories survive every platform update, your agents are never silently deleted, and your full companion data is always exportable. The Replika 2.0 amnesia wave stops here.',
};

export default function MemoryGuaranteePage() {
  return (
    <div className="min-h-screen">
      <MemoryGuaranteeLandingSection />
      <MemoryStabilityPledge variant="strip" />
    </div>
  );
}
